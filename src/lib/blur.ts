/**
 * チームカラーベースのblurプレースホルダーSVG。
 * Next.js Image の placeholder="blur" + blurDataURL 用。
 * 画像ごとにR2 fetchせず固定のブランドカラープレースホルダーを返す。
 */

const BLUR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><filter id="b"><feGaussianBlur stdDeviation="4"/></filter><rect width="8" height="8" fill="#0e0e18" filter="url(#b)"/><circle cx="4" cy="3" r="3" fill="rgba(168,85,247,0.15)" filter="url(#b)"/></svg>`;

export const playerBlurDataURL = `data:image/svg+xml;base64,${Buffer.from(BLUR_SVG).toString("base64")}`;
