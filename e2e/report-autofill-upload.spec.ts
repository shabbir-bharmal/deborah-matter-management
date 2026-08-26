import { expect, test } from '@playwright/test';

function csvFile(name: string, content: string) {
    return { name, mimeType: 'text/csv', buffer: Buffer.from(content) };
}

test.beforeEach(async ({ page }) => {
    await page.goto('/matters/inv-001/reports');
});

test.describe('report auto-fill upload UI', () => {
    test('accepts supported files and lists them with type badges', async ({ page }) => {
        await page
            .getByTestId('file-input')
            .setInputFiles([
                {
                    name: 'interview-notes.docx',
                    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    buffer: Buffer.from('x'),
                },
                csvFile('witnesses.csv', 'a,b\n'),
                { name: 'memo.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-') },
            ]);

        const list = page.getByTestId('uploaded-file-list');
        await expect(list).toBeVisible();
        for (const name of ['interview-notes.docx', 'witnesses.csv', 'memo.pdf']) {
            await expect(page.getByText(name).first()).toBeVisible();
        }
        await expect(page.getByText('DOCX', { exact: true })).toBeVisible();
        await expect(page.getByText('CSV', { exact: true })).toBeVisible();
        await expect(page.getByText('PDF', { exact: true })).toBeVisible();
    });

    test('rejects unsupported file types with an inline error and no crash', async ({ page }) => {
        await page.getByTestId('file-input').setInputFiles([{ name: 'photo.png', mimeType: 'image/png', buffer: Buffer.from('x') }]);

        const rejections = page.getByTestId('upload-rejections');
        await expect(rejections).toContainText(/Unsupported file type/);
        await expect(page.getByTestId('uploaded-file-list')).toHaveCount(0);
    });

    test('rejects files above the 10 MB client-side limit', async ({ page }) => {
        await page.getByTestId('file-input').setInputFiles([csvFile('huge.csv', 'x'.repeat(11 * 1024 * 1024))]);

        await expect(page.getByTestId('upload-rejections')).toContainText(/10 MB/);
    });

    test('allows duplicate file names as distinct entries and supports removal', async ({ page }) => {
        await page.getByTestId('file-input').setInputFiles([csvFile('notes.csv', 'a\n'), csvFile('notes.csv', 'b\n')]);

        await expect(page.getByTestId('uploaded-file-list')).toBeVisible();
        expect(await page.getByText('notes.csv').count()).toBe(2);

        await page
            .getByRole('button', { name: /Remove notes\.csv/ })
            .first()
            .click();
        expect(await page.getByText('notes.csv').count()).toBe(1);
    });
});
