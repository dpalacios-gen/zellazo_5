export class UrlService {
  private static getPublicBaseUrl(): string {
    return process.env.PUBLIC_BASE_URL ?? 'http://localhost:5173'
  }

  private static getApiBaseUrl(): string {
    return process.env.API_BASE_URL ?? 'http://localhost:3333'
  }

  static buildRegistrationUrl(localPublicId: string): string {
    const base = this.getPublicBaseUrl()
    return `${base}/registro?local=${encodeURIComponent(localPublicId)}`
  }

  static buildStampUrl(token: string): string {
    const base = this.getPublicBaseUrl()
    return `${base}/stamp?t=${encodeURIComponent(token)}`
  }

  static buildRedeemUrl(token: string): string {
    const base = this.getPublicBaseUrl()
    return `${base}/redeem?t=${encodeURIComponent(token)}`
  }

  static get apiBaseUrl(): string {
    return this.getApiBaseUrl()
  }

  static get publicBaseUrl(): string {
    return this.getPublicBaseUrl()
  }
}

export default UrlService


