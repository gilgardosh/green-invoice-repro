import { readFileSync } from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

config({
  path: './.env',
});

async function uploadFile() {
  // Authenticate
  const authParams = {
    id: process.env.GREEN_INVOICE_ID,
    secret: process.env.GREEN_INVOICE_SECRET,
  };
  const authToken = await fetch('https://api.greeninvoice.co.il/api/v1/account/token', {
    method: 'POST',
    body: JSON.stringify(authParams),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => res.json())
    .then((res: { token: string }) => res.token);

  // Fetch file upload params
  const fileUploadParams = await fetch(
    'https://apigw.greeninvoice.co.il/file-upload/v1/url?context=expense&data=%7B%22source%22%3A%205%7D',
    {
      method: 'GET',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    },
  ).then(res => res.json());

  if (!fileUploadParams) {
    throw new Error('No file upload params');
  }

  // Prepare upload content
  const form = new FormData();
  for (const [field, value] of Object.entries(fileUploadParams.fields)) {
    if (value) {
      form.append(field, value as string);
    }
  }
  const filePath = path.join(__dirname, '../../file.jpg');
  const file = new File([await readFileSync(filePath)], 'file.jpg');
  form.append('file', file);

  // Upload file
  const expenseDraft = await fetch(fileUploadParams.url, {
    method: 'POST',
    body: form,
    headers: {
      // 'Content-Type': 'multipart/form-data', // NOTE: Adding this header seems to break the request, resulting in 400 malformed request
    },
  }).then(async res => {
    if ([200, 201].includes(res.status)) {
      return res.json();
    }

    console.error(res);
    console.error(await res.text());
    throw new Error('Failed to upload file');
  });

  console.log(JSON.stringify(expenseDraft, null, 2));

  process.exit(0);
}

uploadFile();
