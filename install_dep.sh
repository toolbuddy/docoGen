#!/bin/bash 

<<COMMENT1
    Use to automatically install MikTex dependency for docoGen
COMMENT1

if [[ "$OSTYPE" == "linux-gnu" ]]; then
    echo "Linux platform detected. Installing..."
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys D6BC243565B2087BC3F897C9277A7293F59E4889
    echo "deb http://miktex.org/download/ubuntu xenial universe" | sudo tee /etc/apt/sources.list.d/miktex.list
    sudo apt update && sudo apt install miktex
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac OSX
    echo "Not Support MacOS script now"
elif [[ "$OSTYPE" == "cygwin" ]]; then
    # POSIX compatibility layer and Linux environment emulation for Windows
    echo "Not Support cygwin"
elif [[ "$OSTYPE" == "msys" ]]; then
    # Lightweight shell and GNU utilities compiled for Windows (part of MinGW)
    echo "Not Support msys"
fi

# upgrade package
sudo apt-get upgrade