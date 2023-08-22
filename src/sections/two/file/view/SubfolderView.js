import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  getMetadata,
} from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuthContext } from 'src/auth/hooks';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
} from '@mui/material';

const SubfolderView = () => {
  const { folderId } = useParams();
  const { user } = useAuthContext();

  const [subfolderName, setSubfolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubfolderNameChange = (event) => {
    setSubfolderName(event.target.value);
  };

  const handleFileUpload = () => {
    if (!selectedFile) return;

    const storageRef = ref(storage, `subfolders/${folderId}/${selectedFile.name}`);
    uploadBytes(storageRef, selectedFile)
      .then(() => {
        // File uploaded successfully
        // You can update state or display a success message
      })
      .catch((error) => {
        // Handle error
        console.error('File upload error:', error);
      });
  };

  const handleCreateSubfolder = () => {
    const firestore = getFirestore(app);
    const subfolderData = {
      name: subfolderName,
      parent: folderId,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDoc(collection(firestore, 'subfolders'), subfolderData)
      .then(() => {
        // Subfolder created successfully
        // You can update state or display a success message
        setSubfolderName('');
      })
      .catch((error) => {
        // Handle error
        console.error('Subfolder creation error:', error);
      });
  };

  const handleFileSelection = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Subfolder View
      </Typography>
      <Typography variant="h6" gutterBottom>
        Create Subfolder
      </Typography>
      <TextField
        label="Subfolder Name"
        value={subfolderName}
        onChange={handleSubfolderNameChange}
        fullWidth
        margin="normal"
        variant="outlined"
      />
      <Button variant="contained" color="primary" onClick={handleCreateSubfolder}>
        Create Subfolder
      </Button>
      <Typography variant="h6" gutterBottom style={{ marginTop: '2rem' }}>
        Upload File
      </Typography>
      <input type="file" onChange={handleFileSelection} />
      <Button variant="contained" color="primary" onClick={handleFileUpload}>
        Upload File
      </Button>
      {/* Display subfolders and files */}
    </Container>
  );
};

export default SubfolderView;
