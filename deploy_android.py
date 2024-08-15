import os
import sys
import subprocess
import json
from google.cloud import storage

# Constants
BUCKET_NAME = 'public-fyx'
BUCKET_PATH = 'updates/'
VERSION_FILE_NAME = 'version.json'
GCS_URL = f'https://storage.googleapis.com/{BUCKET_NAME}/{BUCKET_PATH}'

def run_command(command):
    """Run a shell command."""
    try:
        print(f'Running: {command}')
        subprocess.run(command, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f'Error running command: {command}\n{e}')
        sys.exit(1)

def upload_to_gcs(file_path, destination_blob_name):
    """Upload a file to Google Cloud Storage."""
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)
    blob = bucket.blob(destination_blob_name)

    try:
        blob.upload_from_filename(file_path)
        blob.cache_control = 'no-cache'
        blob.patch()
        print(f'Successfully uploaded {file_path} to {GCS_URL}{destination_blob_name}')
    except Exception as e:
        print(f'Failed to upload {file_path} to GCS: {e}')
        sys.exit(1)

def update_version_file(version, url):
    """Update the version.json file with the new version and URL."""
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)
    blob = bucket.blob(BUCKET_PATH + VERSION_FILE_NAME)

    try:
        # Download and parse the existing version.json
        version_data = blob.download_as_string()
        version_json = json.loads(version_data)

        # Update the JSON content
        version_json['version'] = version
        version_json['url'] = url

        # Write updated content to a temporary file
        temp_version_file_path = VERSION_FILE_NAME
        with open(temp_version_file_path, 'w') as f:
            json.dump(version_json, f, indent=2)

        # Upload updated version.json back to GCS
        upload_to_gcs(temp_version_file_path, BUCKET_PATH + VERSION_FILE_NAME)
        os.remove(temp_version_file_path)
    except Exception as e:
        print(f'Failed to update version file: {e}')
        sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print('Usage: python deploy_android.py <version>')
        sys.exit(1)

    version = sys.argv[1]
    zip_file_name = f'update_{version.replace(".", "_")}.zip'
    download_url = f'{GCS_URL}{zip_file_name}'

    # Ionic build process
    run_command('ionic build --prod')
    run_command('ionic cap sync')
    run_command('ionic cap copy android')

    # Change directory to www and create the zip file
    os.chdir('www')
    run_command(f'zip -r ../{zip_file_name} ./')

    # Move back to the root directory
    os.chdir('..')

    # Upload the zip file to Google Cloud Storage
    upload_to_gcs(zip_file_name, BUCKET_PATH + zip_file_name)

    # Update the version.json file with the new version and URL
    update_version_file(version, download_url)

    print(f'Deployment completed successfully for version {version}')

if __name__ == '__main__':
    main()

