# git-batch-cloner
> Clone all repositories that you have permission to

## Install

Using npm:

```console
npm install git-batch-cloner -g
```

Using yarn:

```console
yarn global add git-batch-cloner
```

## Usage

### Gitlab
```sh
gitlab-clone --url=https://gitlab-url --token="your person token" --output="./repo"
# Specify the configuration file
gitlab-clone --config=./.gitlab.env
```

## Using dotenv parameters

```sh
# .env file
URL=https://gitlab-url
TOKEN=your person token
OUTPUT=clone target dir

# If there are multiple clones that need to be cloned
# gitlab
GITLAB_URL=https://gitlab-url
GITLAB_TOKEN=your person token
GITLAB_OUTPUT=clone target dir
# special goup_id
GITLAB_GROUP_ID_LIST="190"

```


