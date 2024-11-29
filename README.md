# Map Viewer for Call of Duty

Currently only supports Call of Duty 1 or Call of Duty: United Offensive. Adding support for up to CoD:4 should be very
doable.

This project is not flawless. There are some rendering issues, most notably z-fighting issues. To structurally resolve
these issues we'd need to parse the shader files and re-create the original shaders.

## Running Locally

- Clone this repo
- Create the `public/cod/` folders. Extract all your `.pk3` files into this folder.
- Create the file `public/cod/index`. This file should contain a list of _all_ the files in the folder (and
  sub-folders).
    - Example linux command to do this: `find . -type f -printf '%P\n' > index`
    - Example PowerShell command to do this:
      `Get-ChildItem -Recurse | Where-Object { -not $_.PSIsContainer } | ForEach-Object { $_.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/") } | Sort-Object | Set-Content index`
- run `npm install`
- run `npm run dev`
- A local server should be accessible at `http://localhost:3000`