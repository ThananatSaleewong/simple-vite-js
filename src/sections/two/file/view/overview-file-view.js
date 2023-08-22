import { useState, useCallback, useEffect } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
// routes
import { paths } from 'src/routes/paths';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// import { _folders, _files } from 'src/_mock';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
// eslint-disable-next-line import/no-unresolved
// import { UploadBox } from 'src/components/upload';
import { useSettingsContext } from 'src/components/settings';
import UploadBox from 'src/components/upload/upload-box';
import FileManagerPanel from 'src/sections/file-manager/file-manager-panel';
import { _files, _folders, _mock } from 'src/_mock';
import FileManagerFolderItem from 'src/sections/file-manager/file-manager-folder-item';
import FileRecentItem from 'src/sections/file-manager/file-recent-item';
import FileManagerNewFolderDialog from 'src/sections/file-manager/file-manager-new-folder-dialog';
import { app, storage } from 'src/firebase';
import {
  Button,
  ButtonBase,
  CircularProgress,
  Divider,
  IconButton,
  ImageList,
  ImageListItem,
  ListItemText,
  MenuItem,
  Paper,
  Popover,
} from '@mui/material';
import {
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
  getMetadata,
  deleteObject,
} from 'firebase/storage';
import Image from 'src/components/image/image';
import {
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  serverTimestamp,
} from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthContext } from 'src/auth/hooks';
import firebase from 'firebase/compat/app';
import { fData } from 'src/utils/format-number';
import { popover } from 'src/theme/overrides/components/popover';
import CustomPopover from 'src/components/custom-popover/custom-popover';
import { enqueueSnackbar } from 'notistack';
import { copy } from 'stylis';
import { checkbox } from 'src/theme/overrides/components/checkbox';
import { useNavigate } from 'react-router';
import { progress } from 'src/theme/overrides/components/progress';

// ----------------------------------------------------------------------

const GB = 1000000000 * 24;

const TIME_LABELS = {
  week: ['Mon', 'Tue', 'Web', 'Thu', 'Fri', 'Sat', 'Sun'],
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  year: ['2018', '2019', '2020', '2021', '2022'],
};

// ----------------------------------------------------------------------

export default function OverviewFileView() {
  const theme = useTheme();

  const smDown = useResponsive('down', 'sm');

  const settings = useSettingsContext();

  const [folderName, setFolderName] = useState('');

  const [files, setFiles] = useState([]);

  const newFolder = useBoolean();

  const upload = useBoolean();

  const [loading, setLoading] = useState(false);
  const handleChangeFolderName = useCallback((event) => {
    setFolderName(event.target.value);
  }, []);

  // const handleCreateNewFolder = useCallback(() => {

  //   newFolder.onFalse();
  //   setFolderName('');
  //   console.info('CREATE NEW FOLDER');
  // }, [newFolder]);

  const [currentFolder, setCurrentFolder] = useState(null);

  const setUserAndCurrentFolder = (newUser, newCurrentFolder) => {
    // setUser(newUser);
    setCurrentFolder(newCurrentFolder);
  };

  const { user } = useAuthContext();
  const firestore = getFirestore(app);

  const handleCreateNewFolder = useCallback(async () => {
    if (folderName.length === 0) {
      // ... (your existing code)
    } else if (folderName.length < 3) {
      alert('Folder name should have at least 3 characters.');
    } else {
      try {
        setLoading(true);
        const data = {
          createdAt: serverTimestamp(),
          createdBy: 'Test User',
          lastAccessed: null,
          location: currentFolder === 'root' ? 'root' : 'some_location',
          name: folderName,
          path: currentFolder === 'root' ? [{ name: 'root' }] : [{ name: 'parent_folder_name' }],
          parent: currentFolder,
          updatedAt: serverTimestamp(),
          userId: user.uid,
        };

        // Create a new folder document in the Firestore collection
        // await addDoc(collection(firestore, 'folders'), data);
         // Create a new folder document in the Firestore collection
      const newFolderDocRef = await addDoc(collection(firestore, 'folders'), data);

      // Get the generated folder ID
      const newFolderId = newFolderDocRef.id;



        // Update the state with the new folder data
        setFolders((prevFolders) => [
          ...prevFolders,
          {
            id: newFolderId, // Use the appropriate id for your folder
            name: folderName,
            type: 'folder',
            // ... (other folder properties)
          },
        ]);

        setLoading(false);
        toast.success('Folder created successfully!');
        console.log('Folder created:', data);
      } catch (error) {
        console.error('Error creating folder:', error);
        setLoading(false);
      }
      newFolder.onFalse();
      setFolderName('');
      console.info('CREATE NEW FOLDER');
    }
  }, [folderName, newFolder, user, currentFolder, firestore]);
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const folderCollection = collection(firestore, 'folders');
        const folderSnapshot = await getDocs(folderCollection);
        const folderData = folderSnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        setFolders(folderData);
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    };

    fetchFolders();
  }, [firestore]);

  const handleDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const imageRef = ref(storage, `images/${file.name}`);
        uploadBytes(imageRef, file)
          .then((snapshot) => {
            getDownloadURL(snapshot.ref).then((url) => {
              setImageList((prev) => [...prev, url]);
              getMetadata(snapshot.ref).then((metadata) => {
                setFiles((prev) => [
                  ...prev,
                  {
                    id: `${metadata.generation}_file`,
                    name: metadata.name,
                    url: url,
                    shared: [],
                    tags: [],
                    size: metadata.size,
                    createdAt: metadata.timeCreated,
                    modifiedAt: metadata.updated,
                    type: metadata.contentType.split('/')[1],
                    isFavorited: false, // Replace with your logic
                  },
                ]);
                toast.success('Uploaded');
              });
            });
          })
          .catch((error) => {
            toast.warning(error, 'File upload failed. Please try again.');
            console.error('Error uploading file:', error);
          });
      });
    },
    [] // No dependency required for this example
  );
  useEffect(() => {
    const imageListRef = ref(storage, 'images/');
    listAll(imageListRef).then((response) => {
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImageList((prev) => [...prev, url]);
          getMetadata(item).then((metadata) => {
            setFiles((prev) => [
              ...prev,
              {
                id: `${metadata.generation}_file`,
                name: metadata.name,
                url: url,
                shared: [],
                tags: [],
                size: metadata.size,
                createdAt: metadata.timeCreated,
                modifiedAt: metadata.updated,
                type: metadata.contentType.split('/')[1],
                isFavorited: false, // Replace with your logic
              },
            ]);
          });
        });
      });
    });
  }, []);
  const details = useBoolean();
  const confirm = useBoolean();
  // this is function upload with firebase
  const [imageUpload, setImageUpload] = useState(null);
  const [imageList, setImageList] = useState([]);
  const imageListRef = ref(storage, 'images/');
  const handleDeleteFile = async (file) => {
    const imageRef = ref(storage, `images/${file.name}`);

    try {
      await deleteObject(imageRef);
      // Remove the deleted file from the state
      setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id));

      // Show success toast
      toast.success('File deleted successfully!');
    } catch (error) {
      // Show error toast
      toast.error('An error occurred while deleting the file.');
      console.error('Error deleting file:', error);
    }
  };
  const [folders, setFolders] = useState([]); // State to hold folder data
  const [folderList, setFolderList] = useState([]);

  useEffect(() => {
    const fetchFolders = async () => {
      const folderCollection = collection(firestore, 'folders');
      const folderSnapshot = await getDocs(folderCollection);
      const folderData = folderSnapshot.docs.map((doc) => {
        doc.data();
        console.log(doc.data());
        folders.push({
          id: doc.data().userId,
          name: doc.data().name,
          type: 'folder',
          url: 'URL',
          shared: {
            id: doc.data().userId,
            name: doc.data().name,
            email: doc.data().createdBy,
            avatarUrl: 'string',
            permission: 'string',
          },
          tags: [],
          size: 10,
          totalFiles: 100,
          createdAt: doc.data().createdAt,
          modifiedAt: doc.data().updatedAt,
          isFavorited: doc.data().lastAccessed,
        });
      });
    };
    fetchFolders();
  }, [firestore]);
  const handleDeleteFolder = (folder) => {
    // Your code to delete the folder goes here
  };
  const navigate = useNavigate();
  const handleFolderClick = (folderId) => {
    // Navigate to the subfolder view with the folderId as a parameter
    navigate(`/subfolder/${folderId}`);
  };
  const [deleteButtonAnchor, setDeleteButtonAnchor] = useState(null);

  const handleDeleteButtonClick = (event, folder) => {
    setDeleteButtonAnchor(event.currentTarget);
    setCurrentFolder(folder); // Set the current folder to be deleted
  };

  const handleDeleteConfirm = async () => {
    try {
      if (currentFolder) {
        const folderRef = doc(collection(firestore, 'folders'), currentFolder.id);
        await deleteDoc(folderRef);

        // Show success toast
        toast.success('Folder deleted successfully!');
      }
    } catch (error) {
      // Show error toast
      toast.error('An error occurred while deleting the folder.');
      console.error('Error deleting folder:', error);
    }

    setDeleteButtonAnchor(null); // Close the popover
    setCurrentFolder(null); // Clear the current folder
  };

  const handlePopoverClose = () => {
    setDeleteButtonAnchor(null);
  };

  return (
    <>
      <ToastContainer />
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Grid xs={12} md={6} lg={8}>
          <UploadBox
            onChange={(event) => {
              setImageUpload(event.target.files[0]);
            }}
            onDrop={handleDrop}
            placeholder={
              <Stack spacing={0.5} alignItems="center" sx={{ color: 'text.disabled' }}>
                <Iconify icon="eva:cloud-upload-fill" width={40} />
                <Typography variant="body2">Upload file</Typography>
              </Stack>
            }
            sx={{
              mb: 3,
              py: 2.5,
              width: 'auto',
              height: 'auto',
              borderRadius: 1.5,
            }}
          />

          {/* {imageList.map((url) => {
            return <Image src={url} />;
          })} */}

          <div>
            <FileManagerPanel
              title="Folders"
              link={paths.dashboard.fileManager}
              onOpen={newFolder.onTrue}
              sx={{ mt: 5 }}
            />

            <Scrollbar>
              <Stack direction="row" spacing={3} sx={{ pb: 3 }}>
                {loading ? (
                  // Show loading spinner
                  <CircularProgress />
                ) : (
                  folders.map((folder, index) => (
                    <Stack
                      key={index}
                      component={Paper}
                      variant="outlined"
                      spacing={1}
                      alignItems="flex-start"
                      sx={{
                        p: 2.5,
                        maxWidth: 222,
                        borderRadius: 2,
                        bgcolor: 'unset',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      <Box
                        component="img"
                        onClick={() => handleFolderClick(folder.id)}
                        src="/assets/icons/files/ic_folder.svg"
                        sx={{ width: 36, height: 36 }}
                      />
                      <Stack
                        direction="row"
                        alignItems="center"
                        sx={{
                          top: 8,
                          right: 8,
                          position: 'absolute',
                        }}
                      >
                        <IconButton onClick={(event) => handleDeleteButtonClick(event, folder)}>
                          <Iconify icon="eva:more-vertical-fill" />
                        </IconButton>
                      </Stack>
                      <ListItemText
                        onClick={details.onTrue}
                        primary={folder.name}
                        primaryTypographyProps={{
                          noWrap: true,
                          typography: 'subtitle1',
                        }}
                        secondaryTypographyProps={{
                          mt: 0.5,
                          component: 'span',
                          alignItems: 'center',
                          typography: 'caption',
                          color: 'text.disabled',
                          display: 'inline-flex',
                        }}
                      />
                    </Stack>
                  ))
                )}
                <Popover
                  open={Boolean(deleteButtonAnchor)}
                  anchorEl={deleteButtonAnchor}
                  onClose={handlePopoverClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={handleDeleteConfirm} sx={{ color: 'error.main' }}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                    Delete
                  </MenuItem>
                </Popover>
              </Stack>
            </Scrollbar>

            {/* <FileManagerPanel
              title="Recent Files"
              link={paths.dashboard.fileManager}
              onOpen={upload.onTrue}
              sx={{ mt: 2 }}
            /> */}
            <Stack direction="row" alignItems="center" spacing={1} flexGrow={1} sx={{ mb: 2 }}>
              <Typography variant="h6"> Recent Files </Typography>
            </Stack>

            <Stack spacing={2}>
              {files.map((file) => (
                <FileRecentItem
                  key={file.id}
                  file={file}
                  onDelete={() => handleDeleteFile(file)} // Pass the handleDeleteFile function
                />
              ))}
            </Stack>
          </div>
        </Grid>
      </Container>

      <FileManagerNewFolderDialog open={upload.value} onClose={upload.onFalse} />

      <FileManagerNewFolderDialog
        open={newFolder.value}
        onClose={newFolder.onFalse}
        title="New Folder"
        folderName={folderName}
        onChangeFolderName={handleChangeFolderName}
        onCreate={handleCreateNewFolder} // Pass the handleCreateNewFolder function
      />
    </>
  );
}
