import { query } from '../db.js';
import { compressAvatar } from '../utils/image.js';

async function migrate() {
    console.log('🚀 Starting Avatar Migration...');
    
    try {
        // Find all users with base64 avatars
        const result = await query(
            "SELECT id, name, length(avatar_url) as len FROM users WHERE avatar_url LIKE 'data:image%' ORDER BY len DESC"
        );
        
        console.log(`📊 Found ${result.rows.length} users with base64 avatars.`);
        
        let successCount = 0;
        let skipCount = 0;
        let failCount = 0;
        let totalSaved = 0;

        for (const user of result.rows) {
            const oldLen = user.len;
            
            // Only compress if it's larger than ~20KB or we want to force WebP
            // For this fix, we force all base64 to WebP to ensure consistency
            console.log(`Processing ${user.name} (ID: ${user.id}) - Current Size: ${(oldLen / 1024).toFixed(2)} KB`);
            
            const userFull = await query("SELECT avatar_url FROM users WHERE id = $1", [user.id]);
            const oldUrl = userFull.rows[0].avatar_url;
            
            const newUrl = await compressAvatar(oldUrl);
            
            if (newUrl && newUrl !== oldUrl) {
                const newLen = newUrl.length;
                await query("UPDATE users SET avatar_url = $1 WHERE id = $2", [newUrl, user.id]);
                
                const saved = oldLen - newLen;
                totalSaved += saved;
                successCount++;
                console.log(`✅ Compressed! New Size: ${(newLen / 1024).toFixed(2)} KB (Saved: ${(saved / 1024).toFixed(2)} KB)`);
            } else if (newUrl === oldUrl) {
                skipCount++;
                console.log(`⏩ Skipped (Already optimal or not a base64 string)`);
            } else {
                failCount++;
                console.log(`❌ Failed to compress`);
            }
        }

        console.log('\n--- Migration Summary ---');
        console.log(`✅ Success: ${successCount}`);
        console.log(`⏩ Skipped: ${skipCount}`);
        console.log(`❌ Failed: ${failCount}`);
        console.log(`📉 Total Bandwidth Saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
        console.log('--------------------------');
        
        process.exit(0);
    } catch (error) {
        console.error('💥 Critical Error during migration:', error);
        process.exit(1);
    }
}

migrate();
