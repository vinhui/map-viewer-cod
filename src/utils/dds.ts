const DDS_MAGIC = 0x20534444 // "DDS "
const DDS_HEADER_SIZE = 124
const DDPF_ALPHAPIXELS = 0x00000001 // Alpha flag in legacy DDS headers
const DDPF_FOURCC = 0x00000004 // Flag for FourCC-compressed formats
const DDPF_RGB = 0x00000040 // Flag for RGB format
const DDPF_RGBA = 0x00000041 // Flag for RGBA format


// DXGI formats that support alpha channels
const ALPHA_DXGI_FORMATS = new Set([
    28,  // DXGI_FORMAT_R8G8B8A8_UNORM
    87,  // DXGI_FORMAT_B8G8R8A8_UNORM
    2,   // DXGI_FORMAT_R16G16B16A16_FLOAT
    24,  // DXGI_FORMAT_R10G10B10A2_UNORM
    71,  // DXGI_FORMAT_BC1_UNORM (DXT1) - may have alpha
    74,  // DXGI_FORMAT_BC2_UNORM (DXT3)
    77,  // DXGI_FORMAT_BC3_UNORM (DXT5)
    // Add additional DXGI formats as needed
    10,  // DXGI_FORMAT_A8_UNORM
    51,  // DXGI_FORMAT_R16G16B16A16_FLOAT
    41,  // DXGI_FORMAT_R32G32B32A32_FLOAT
])

// Known FourCC codes
const FOURCC_CODES = {
    'DXT1': false, // No alpha channel, but can have 1-bit alpha
    'DXT2': true,  // Alpha channel
    'DXT3': true,  // Alpha channel
    'DXT4': true,  // Alpha channel
    'DXT5': true,  // Alpha channel
    'R8G8B8A8': true, // Uncompressed RGBA
    'B8G8R8A8': true, // Uncompressed BGRA
    'R8G8B8': false, // No alpha channel
    'B8G8R8': false, // No alpha channel
}

export function doesDdsHaveAlpha(bytes: Uint8Array): boolean {
    const view = new DataView(bytes.buffer)
    // Check for DDS magic number
    const magic = view.getUint32(0, true)
    if (magic !== DDS_MAGIC) {
        throw new Error('Not a valid DDS file')
    }

    // Check the header size
    const headerSize = view.getUint32(4, true)
    if (headerSize !== DDS_HEADER_SIZE) {
        throw new Error('Invalid DDS header size')
    }

    // Log the entire header for troubleshooting
    //// console.log("Complete Header Data:", buffer.slice(0, 128).toString('hex'));

    // Pixel format flags
    const pfFlags = view.getUint32(76, true)

    // Explicitly target FourCC bytes at position 84–87 based on observed header layout
    const explicitFourCCBytes = bytes.slice(84, 88)
    const explicitFourCCString = String.fromCharCode(...explicitFourCCBytes)

    // Output Pixel Format Flags and FourCC string
    // console.log('Pixel Format Flags:', pfFlags.toString(16))
    // console.log('Explicit FourCC Bytes:', explicitFourCCBytes)
    // console.log('Explicit FourCC as String:', explicitFourCCString)

    // Check for DXT formats using the known FourCC codes
    if (FOURCC_CODES[explicitFourCCString]) {
        // console.log(`Detected ${explicitFourCCString} format.`)
        return FOURCC_CODES[explicitFourCCString]
    }

    // Handle cases where the DDS file might not be using a FourCC format
    if (pfFlags & DDPF_ALPHAPIXELS) {
        // console.log('Alpha channel detected based on DDPF_ALPHAPIXELS flag.')
        return true
    }

    // Handle common RGB and RGBA formats
    if (pfFlags & DDPF_RGB) {
        // console.log('RGB format detected.')
        return false // RGB typically does not include alpha
    } else if (pfFlags & DDPF_RGBA) {
        // console.log('RGBA format detected, indicating an alpha channel.')
        return true // RGBA always has an alpha channel
    }

    // Check for DX10 format
    if (explicitFourCCString === 'DX10') {
        // console.log('Detected DX10 format. Parsing DX10 header...')
        const dx10HeaderOffset = 128 // DX10 header starts after the standard DDS header
        const dxgiFormat = view.getUint32(dx10HeaderOffset, true)
        // console.log('DXGI Format:', dxgiFormat)
        return ALPHA_DXGI_FORMATS.has(dxgiFormat)
    }

    // console.log('No alpha channel detected.')
    return false
}