#!/bin/bash
sed -i "${1//"+"/""}s/.*/  * Daily Build/" -i $2
