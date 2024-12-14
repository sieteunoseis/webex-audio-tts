#!/bin/bash

# See https://www.mslinn.com/blog/2020/11/30/propagating-git-template-changes.html

function help {
  if [ "$1" ]; then printf "\nError: $1\n\n"; fi
  echo "Usage:

$0 templateUrl newProjectName"
  exit 1
}

if [ -z "$(which git)" ]; then
  echo "Please install git and rerun this script"
  exit 2
fi

if [ -z "$(which hub)" ]; then
  echo "Please install hub and rerun this script"
  exit 3
fi

if [ -z "$1" ]; then help "No git project was specified as a template."; fi
if [ -z "$2" ]; then help "Please provide the name of the new project based on the template"; fi

git clone "$1" "$2"
cd "$2"
git remote rename origin upstream
git remote set-url --push upstream no_push

# Add the -p option to create a private repository
hub create "$2"
git branch -M master
git push -u origin master