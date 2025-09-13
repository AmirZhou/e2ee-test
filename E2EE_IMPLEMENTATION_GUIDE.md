# E2EE Secure Files Protocol

## 📋 Overview

This protocol defines end-to-end encryption for file storage to ensure compliance with Alberta's PIPA (Personal Information Protection Act) and Canada's PIPEDA (Personal Information Protection and Electronic Documents Act).

**Key Principle**: Files are encrypted on the client before upload and decrypted on the client after download. The server never has access to unencrypted content.

## 🏛️ Legal Compliance Requirements

### Alberta PIPA & Canada PIPEDA Compliance

**Why E2EE is Required:**
- **PIPA Section 34**: Organizations must protect personal information with safeguards appropriate to the sensitivity of the information
- **PIPEDA Principle 7**: Personal information must be protected by security safeguards appropriate to the sensitivity of the information
- **Breach Notification**: Both acts require notification of privacy breaches - E2EE minimizes breach impact
- **Data Sovereignty**: Ensures user control over their sensitive documents

**E2EE Benefits for Compliance:**
- ✅ **Zero-knowledge architecture** - server cannot access plaintext
- ✅ **Breach protection** - compromised servers cannot expose user files  
- ✅ **User control** - only users with passphrases can decrypt
- ✅ **Audit trail** - clear separation of encrypted storage vs. user access

## 🔄 Sequence Diagram

![E2EE - Sequence Diagram](https://hallowed-ptarmigan-685.convex.cloud/api/storage/3f573be1-d33f-4d0f-bea0-95cf47709709)


## Example Demo
![img](https://hallowed-ptarmigan-685.convex.cloud/api/storage/c3a577cc-f3a2-444b-a3e4-cc7042906005)
![Live](https://e2ee-test.paraflux.ca)

## Repo
![Git Repo](https://github.com/AmirZhou/e2ee-test)

## 🔄 Protocol Implementation

### Frontend Responsibilities
1. **File Encryption**: Encrypt files with user passphrase before upload
2. **File Decryption**: Decrypt downloaded files with user passphrase  
3. **Crypto Library**: Choose AES-256 or equivalent (Web Crypto API, TweetNaCl, etc.)
4. **Passphrase Management**: Handle securely, clear from memory after use

### Backend Responsibilities  
1. **Upload URL Generation**: Provide secure upload endpoints
2. **Metadata Storage**: Store filename, size, mimeType (never file content)
3. **Authentication**: Verify user identity for all operations
4. **Row-Level Security**: Users access only their own files
5. **Zero Knowledge**: Never decrypt or access file content

## ⚡ Quick Implementation Checklist

### Frontend Tasks
- [ ] Choose crypto library (Web Crypto API recommended)
- [ ] Implement file encryption before upload
- [ ] Implement file decryption after download
- [ ] Handle passphrase input securely
- [ ] Add progress indicators for encrypt/decrypt operations
- [ ] Implement error handling for wrong passphrases

### Backend Integration
- [ ] Call `generateUploadUrl()` before file upload
- [ ] Upload encrypted blob to returned URL
- [ ] Call `saveFile()` with metadata after successful upload
- [ ] Call `myFiles()` to list user's files
- [ ] Call `getFileUrl()` to get download URL for decryption

### Security Considerations
- [ ] Never log passphrases
- [ ] Clear passphrases from memory after use
- [ ] Use secure random number generation for encryption
- [ ] Validate file types and sizes
- [ ] Implement rate limiting on uploads

## 🚀 Example Usage

```typescript
// Upload example
const uploadFile = async (file: File, passphrase: string) => {
  try {
    await handleFileUpload(file, passphrase);
    toast.success("File encrypted and uploaded!");
  } catch (error) {
    toast.error("Upload failed");
  }
};

// Download example  
const downloadFile = async (fileId: string, passphrase: string) => {
  try {
    await handleFileDecrypt(fileId, passphrase);
    toast.success("File decrypted and downloaded!");
  } catch (error) {
    toast.error("Decryption failed - check passphrase");
  }
};
```

---

**Bottom Line**: The server never sees unencrypted files. All encryption/decryption happens on the client-side. The passphrase is users responsibility to manage securely!