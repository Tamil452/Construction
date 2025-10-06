// api/sheet.js
import { GoogleSpreadsheet } from 'google-spreadsheet';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Only POST allowed');

  try {
    const { name, email } = req.body || {};
    if (!name || !email) return res.status(400).json({ error: 'name & email required' });

    const doc = new GoogleSpreadsheet(process.env.SHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GS_CLIENT_EMAIL,
      private_key: (process.env.GS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    });
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0]; // first sheet
    await sheet.addRow({ Name: name, Email: email, Timestamp: new Date().toISOString() });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err.message || err) });
  }
}
