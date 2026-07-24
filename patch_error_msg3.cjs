const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const oldErrorMsg = `    } catch(e: any) {
      console.error(e);
      // Mode embed search listType=search dari YouTube sudah diblokir untuk situs pihak ketiga
      // Tampilkan pesan yang informatif.
      if (window.location.protocol === 'file:') {
         setErrorMsg('Fitur pencarian hanyak aktif saat online dengan backend. Untuk OFFLINE, mohon copy dan paste langsung URL/Link video (contoh: https://youtube.com/watch?v=...).');
      } else {
         setErrorMsg('Fitur pencarian gagal karena backend API (Netlify Functions) belum terdeploy dengan sempurna. \\n\\nSolusi Sementara: Mohon copy dan paste URL/Link YouTube secara langsung ke kolom pencarian (contoh: https://youtube.com/watch?v=...).');
      }
      // Kita tidak setYoutubeEmbedSrc null agar mini-player tidak hilang jika sedang memutar lagu lain
    }`;

const newErrorMsg = `    } catch(e: any) {
      console.error(e);
      if (window.location.protocol === 'file:') {
         setErrorMsg('Fitur pencarian hanyak aktif saat online dengan backend. Untuk OFFLINE, mohon copy dan paste langsung URL/Link video (contoh: https://youtube.com/watch?v=...).');
      } else {
         setErrorMsg('Pencarian gagal. Mohon pastikan aplikasi di-deploy melalui GitHub (bukan drag & drop folder) agar API Pencarian berfungsi, atau paste langsung Link/URL YouTube ke kolom pencarian.');
      }
    }`;

code = code.replace(oldErrorMsg, newErrorMsg);
fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Patched error messages in Dashboard");
