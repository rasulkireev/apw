import os
import glob
import frontmatter
import requests
from datetime import datetime, date
import sys

MEILISEARCH_HOST = "https://meilisearch.cr.lvtd.dev"
MEILISEARCH_API_KEY = os.environ.get("MEILISEARCH_API_KEY")
INDEX_NAME = "content"

def get_existing_documents():
    """Get all existing documents from Meilisearch."""
    print("Fetching existing documents from Meilisearch...")
    headers = {'Authorization': f'Bearer {MEILISEARCH_API_KEY}'}

    try:
        # Get total number of documents
        stats_response = requests.get(f"{MEILISEARCH_HOST}/indexes/{INDEX_NAME}/stats", headers=headers)
        if stats_response.status_code == 404:
            print("Index doesn't exist yet, starting fresh")
            return {}

        stats = stats_response.json()
        total_docs = stats.get('numberOfDocuments', 0)
        print(f"Found {total_docs} existing documents in Meilisearch")

        # If no documents, return empty dict
        if total_docs == 0:
            return {}

        # Fetch all documents
        existing_docs = {}
        limit = 1000  # Meilisearch pagination limit
        offset = 0

        while offset < total_docs:
            print(f"Fetching documents {offset} to {offset + limit}...")
            response = requests.get(
                f"{MEILISEARCH_HOST}/indexes/{INDEX_NAME}/documents",
                headers=headers,
                params={'limit': limit, 'offset': offset}
            )

            if response.status_code != 200:
                print(f"Error fetching documents. Status code: {response.status_code}")
                print(f"Response: {response.text}")
                return {}

            docs = response.json()
            for doc in docs:
                if 'slug' in doc:
                    existing_docs[doc['slug']] = doc
                elif 'id' in doc:
                    existing_docs[doc['id']] = doc
                else:
                    print(f"Document missing both 'id' and 'slug': {doc}")

            offset += limit

        print(f"Successfully fetched {len(existing_docs)} documents")
        return existing_docs

    except requests.exceptions.RequestException as e:
        print(f"Error connecting to Meilisearch: {e}")
        return {}
    except Exception as e:
        print(f"Unexpected error in get_existing_documents: {e}")
        return {}

def get_all_markdown_files():
    """Get all markdown files from the content directory."""
    print("Scanning for markdown files...")
    md_files = glob.glob('src/content/**/*.md', recursive=True)
    mdx_files = glob.glob('src/content/**/*.mdx', recursive=True)
    total_files = len(md_files) + len(mdx_files)
    print(f"Found {total_files} markdown files ({len(md_files)} .md, {len(mdx_files)} .mdx)")
    return md_files + mdx_files

def process_date(date_value):
    """Convert date to ISO format string if it's a datetime object."""
    if isinstance(date_value, (datetime, date)):
        return date_value.isoformat()
    return date_value

def process_document(file_path):
    """Process a single markdown file and return a document for Meilisearch."""
    try:
        print(f"Processing file: {file_path}")
        with open(file_path, 'r', encoding='utf-8') as f:
            post = frontmatter.load(f)

        # Extract the content without frontmatter
        content = post.content

        # Create base document from frontmatter
        document = dict(post.metadata)

        # Process all date fields in the document
        for key, value in document.items():
            if isinstance(value, (datetime, date)):
                document[key] = process_date(value)

        # Add content
        document['content'] = content

        # Add file path
        document['filepath'] = file_path

        # Ensure there's an ID field (using slug if available, otherwise create from filepath)
        if 'slug' in document:
            document['id'] = document['slug']
        else:
            document['id'] = os.path.splitext(os.path.basename(file_path))[0]

        print(f"Successfully processed {file_path}")
        return document
    except Exception as e:
        print(f"Error processing file {file_path}: {str(e)}")
        return None

def setup_meilisearch():
    """Setup Meilisearch index with proper settings."""
    print("Setting up Meilisearch index...")
    headers = {
        'Authorization': f'Bearer {MEILISEARCH_API_KEY}',
        'Content-Type': 'application/json'
    }

    try:
        # Check if index exists
        print("Checking if index exists...")
        index_response = requests.get(
            f"{MEILISEARCH_HOST}/indexes/{INDEX_NAME}",
            headers=headers
        )

        if index_response.status_code == 404:
            print("Index doesn't exist, creating new index...")
            response = requests.post(
                f"{MEILISEARCH_HOST}/indexes",
                headers=headers,
                json={"uid": INDEX_NAME, "primaryKey": "id"}
            )

            if response.status_code not in [200, 201, 202]:
                print(f"Error creating index. Status code: {response.status_code}")
                print(f"Response: {response.text}")
                sys.exit(1)

        # Configure settings
        settings = {
            "searchableAttributes": [
                "title",
                "content",
                "description",
                "tags",
                "category"
            ],
            "filterableAttributes": [
                "tags",
                "category",
                "type"
            ],
            "sortableAttributes": [
                "dateCreated",
                "dateUpdated"
            ],
            "displayedAttributes": [
                "*"
            ]
        }

        settings_response = requests.patch(
            f"{MEILISEARCH_HOST}/indexes/{INDEX_NAME}/settings",
            headers=headers,
            json=settings
        )

        if settings_response.status_code != 202:
            print(f"Error configuring settings: {settings_response.text}")
            sys.exit(1)

        print("Index settings configured successfully")

    except requests.exceptions.RequestException as e:
        print(f"Error connecting to Meilisearch: {e}")
        sys.exit(1)

def update_meilisearch(documents_to_add, documents_to_delete):
    """Update Meilisearch index with new/updated documents and remove deleted ones."""
    headers = {
        'Authorization': f'Bearer {MEILISEARCH_API_KEY}',
        'Content-Type': 'application/json'
    }

    if documents_to_add:
        print(f"Uploading {len(documents_to_add)} documents...")
        try:
            response = requests.post(
                f"{MEILISEARCH_HOST}/indexes/{INDEX_NAME}/documents",
                headers=headers,
                json=documents_to_add
            )
            if response.status_code != 202:
                print(f"Error uploading documents: {response.text}")
                return False
            print("Documents uploaded successfully")
        except requests.exceptions.RequestException as e:
            print(f"Error uploading documents: {e}")
            return False

    if documents_to_delete:
        print(f"Deleting {len(documents_to_delete)} documents...")
        try:
            response = requests.post(
                f"{MEILISEARCH_HOST}/indexes/{INDEX_NAME}/documents/delete-batch",
                headers=headers,
                json=list(documents_to_delete)
            )
            if response.status_code != 202:
                print(f"Error deleting documents: {response.text}")
                return False
            print("Documents deleted successfully")
        except requests.exceptions.RequestException as e:
            print(f"Error deleting documents: {e}")
            return False

    return True

def main():
    if not MEILISEARCH_API_KEY:
        print("Error: MEILISEARCH_API_KEY environment variable is not set")
        sys.exit(1)

    print("Starting Meilisearch update process...")

    # Setup Meilisearch index
    setup_meilisearch()

    # Get existing documents from Meilisearch
    existing_documents = get_existing_documents()

    # Get all current markdown files
    markdown_files = get_all_markdown_files()

    # Track changes
    documents_to_add = []
    current_file_ids = set()

    # Process all current files
    print("\nProcessing markdown files...")
    for file_path in markdown_files:
        document = process_document(file_path)
        if not document:
            continue

        current_file_ids.add(document['id'])
        documents_to_add.append(document)

    # Find documents to delete (documents that exist in Meilisearch but not in current files)
    documents_to_delete = set(existing_documents.keys()) - current_file_ids

    # Update Meilisearch
    print("\nChanges summary:")
    print(f"- Documents to add/update: {len(documents_to_add)}")
    print(f"- Documents to delete: {len(documents_to_delete)}")

    if update_meilisearch(documents_to_add, documents_to_delete):
        print("\nMeilisearch index updated successfully!")
    else:
        print("\nFailed to update Meilisearch index")
        sys.exit(1)

if __name__ == "__main__":
    main()
