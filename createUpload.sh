# remove old folder and zip
rm -rf archive archive.zip

# create folders
mkdir -p archive/other
mkdir -p archive/press
mkdir -p archive/release
mkdir -p archive/src

# copy
cp screenshots/*.png archive/press
cp -R favicon.ico src/ assets/ archive/src
cp release.html archive/src/index.html
cp LICENSE archive/license.txt
echo "In order to start the game start a webserver inside the source folder and open index.html." > archive/src/readme.txt
echo "A live version is avaiable at http://qtux.github.io/ggj16/." >> archive/src/readme.txt

cp archive/src/readme.txt archive/release/readme.txt

echo "https://www.youtube.com/watch?v=UPFGqE8A6Ag" > archive/press/youtube.txt

# create zip
zip -r archive.zip archive
