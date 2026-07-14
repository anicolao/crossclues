import config from '../playwright.config';

const screenshot = config.expect?.toHaveScreenshot;
if (typeof screenshot !== 'object' || screenshot.maxDiffPixels !== 0 || screenshot.maxDiffPixelRatio !== undefined) {
  throw new Error('Screenshot tests must use maxDiffPixels: 0 and no maxDiffPixelRatio.');
}
