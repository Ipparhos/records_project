#!/bin/bash
set -e

echo "Updating package lists..."
sudo apt update

echo "Installing software-properties-common..."
sudo apt install -y software-properties-common

echo "Adding deadsnakes PPA..."
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update

echo "Installing Python 3.13..."
sudo apt install -y python3.13 python3.13-venv python3.13-dev

echo "Creating virtual environment venv_linux..."
python3.13 -m venv venv_linux

echo "Activating virtual environment and installing requirements..."
source venv_linux/bin/activate
pip install -r requirements.txt

echo "Done! To use your new environment, run: source venv_linux/bin/activate"
