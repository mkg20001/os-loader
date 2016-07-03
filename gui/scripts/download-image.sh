#!/bin/sh

. $FNC

progmax 5
state "Check for new ISO..."
con=`curl 'https://os-loader.mkg20001.sytes.net/?C=M;O=D' 2> /dev/null`
name=`echo $con | grep 'href="image.iso.[a-zA-Z0-9.-]*"' -o | head -n 1 | grep "image.iso.[a-zA-Z0-9.-]*" -o`
echo "Latest ISO is: $name"
prog 1

pt="$HOME/.cache/os-loader/images"
mkdir -p $pt
out=$1
if [ -z $out ]; then
	err "Usage: ./getlatest.sh <OUTPUT>" 2
fi

ipt="$pt/$name"
if [ -f $ipt ]; then
	wget -qq https://os-loader.mkg20001.sytes.net/$name -O $ipt --continue
else
	state "Update... (~5min)"
	wget https://os-loader.mkg20001.sytes.net/$name -O $ipt --continue
fi
prog 4

if [ -h $out ]; then
	echo "Clean old link $out..."
	rm $out
fi
ln -s $ipt $out

finish
