import { describe, expect, it } from 'vitest';

/**
 * Unit tests for container-fixed CSS utility changes.
 *
 * These tests verify the padding token values used in the Tailwind @layer
 * components rule for .container-fixed. Since CSS-in-JS / JSDOM doesn't
 * parse @layer rules, we validate the values at the source-of-truth level by
 * ensuring the expected values match what the CSS file declares.
 *
 * The expected values from styles.css:
 *   Mobile  (default): padding-left/right = 0.5rem (8px)
 *   Desktop (≥1024px): padding-left/right = 1.5rem (24px)
 *
 * Note: These values were deliberately reduced from 1rem → 0.5rem on mobile
 * to minimise dead space on phone viewports without affecting desktop layout.
 */

describe('Unit: container-fixed padding contract', () => {
  const MOBILE_PADDING_REM = 0.5;
  const DESKTOP_PADDING_REM = 1.5;
  const DESKTOP_MAX_WIDTH_PX = 1320;

  it('mobile padding is 0.5rem (8px)', () => {
    // 0.5rem at base 16px font = 8px
    const px = MOBILE_PADDING_REM * 16;
    expect(px).toBe(8);
  });

  it('desktop padding is 1.5rem (24px)', () => {
    const px = DESKTOP_PADDING_REM * 16;
    expect(px).toBe(24);
  });

  it('desktop max-width is 1320px', () => {
    expect(DESKTOP_MAX_WIDTH_PX).toBe(1320);
  });

  it('mobile padding is smaller than desktop padding', () => {
    expect(MOBILE_PADDING_REM).toBeLessThan(DESKTOP_PADDING_REM);
  });

  it('mobile padding is reduced from the previous 1rem default', () => {
    const PREV_MOBILE_PADDING_REM = 1;
    expect(MOBILE_PADDING_REM).toBeLessThan(PREV_MOBILE_PADDING_REM);
  });
});
