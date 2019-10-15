# Command-line Interface for Cloudinary
Not being able to find an easy way to upload files to cloudinary from the command-line, I created this tool to do so.

# Installation
Install using npm

`npm -g install cloudinary-cli`

# Configuration
## Global config
By adding a `$HOME/.cloudinary` file in the following format, all commands will parse that file for it's configuration

```javascript
{
	cloud_name: 'sample', 
	api_key: '874837483274837', 
	api_secret: 'a676b67565c6767a6767d6767f676fe1'
}
```

## Command config
The command line flags will override the global configuration file

```
-n, --cloud_name [cloud_name]  Cloudinary cloud name
-k, --api_key [api_key]        Cloudinary api key
-s, --api_secret [api_secret]  Cloudinary api secret
```

# Usage
# Upload
To upload a single file simply run

`cloudinary upload foo.png`

To upload multiple files, use a space seperated list

`cloudinary upload image1.png image2.png image3.png`

## Options
You can use the following options when uploading

```
  --folder, -f      The folder
  --usefilename     Use the system filename
```