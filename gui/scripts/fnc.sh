#!/bin/sh
#set -e
if ! [ -z $isdev ]; then
  set -o xtrace
fi

sprefix="°"
pprefix="¯"

let pmax=0

log() {
  echo $(date +"%H:%M:%S") $*
}
state() {
  echo $sprefix$*
}
progmax() {
  let pmax=$1;
  prog 0
}
prog() {
  let p=($1*100/pmax)
  echo $pprefix$p
}
err() {
  echo $(date +"%H:%M:%S") $1 1>&2
  let e=0$2
  if [ $e -ne 0 ]; then
    exit $e
  fi
}
finish() {
  prog $pmax
  state "Done"
  exit 0
}
script() {
  bash $(dirname $FNC)/$1.sh "$2" "$3" "$4" "$5"
}
chroot() {
  if [ -z $isos ]; then
    /usr/sbin/chroot $imagedir/bin/bash -x <<ffff
export imagedir=""
export usb="/usb"
$*
ffff
    return $?
  else
    $*
  fi
}
