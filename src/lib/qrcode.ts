import QRCode from 'qrcode'

export interface QRCodeOptions {
  url: string
  size?: number
  darkColor?: string
  lightColor?: string
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

/**
 * Generate QR Code as a PNG data URL (base64)
 */
export async function generateQRCodePNG(options: QRCodeOptions): Promise<string> {
  const { url, size = 400, darkColor = '#1a0a3e', lightColor = '#ffffff', errorCorrectionLevel = 'H' } = options

  const dataUrl = await QRCode.toDataURL(url, {
    width: size,
    margin: 2,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel,
  })

  return dataUrl
}

/**
 * Generate QR Code as SVG string
 */
export async function generateQRCodeSVG(options: QRCodeOptions): Promise<string> {
  const { url, darkColor = '#1a0a3e', lightColor = '#ffffff', errorCorrectionLevel = 'H' } = options

  const svgString = await QRCode.toString(url, {
    type: 'svg',
    margin: 2,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel,
  })

  return svgString
}

/**
 * Generate QR Code as Buffer (for server-side PNG generation)
 */
export async function generateQRCodeBuffer(options: QRCodeOptions): Promise<Buffer> {
  const { url, size = 400, darkColor = '#1a0a3e', lightColor = '#ffffff', errorCorrectionLevel = 'H' } = options

  const buffer = await QRCode.toBuffer(url, {
    width: size,
    margin: 2,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel,
  })

  return buffer
}
