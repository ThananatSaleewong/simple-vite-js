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
import { storage } from 'src/firebase';
import { Button, ImageList, ImageListItem } from '@mui/material';
import { ref, uploadBytes, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import Image from 'src/components/image/image';

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

  const handleChangeFolderName = useCallback((event) => {
    setFolderName(event.target.value);
  }, []);

  const handleCreateNewFolder = useCallback(() => {
    newFolder.onFalse();
    setFolderName('');
    console.info('CREATE NEW FOLDER');
  }, [newFolder]);

  // const handleDrop = useCallback (
  //    (acceptedFiles) => {
  //       const newFiles = acceptedFiles.map((file) =>
  //         Object.assign(file, {
  //           preview: URL.createObjectURL(file),
  //         })
  //       );

  //          const imageRef =  ref(storage, `images/${acceptedFiles[0].name}`);
  //           uploadBytes(imageRef, acceptedFiles[0]).then((snapshot) => {
  //           getDownloadURL(snapshot.ref).then((url) => {
  //             setImageList((prev) => [...prev, url]);
  //           });
  //         })

    
  //   },
  //   [files]
  // );


  const handleDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const imageRef = ref(storage, `images/${file.name}`);
        uploadBytes(imageRef, file).then((snapshot) => {
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
            });
          });
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





  // this is function upload with firebase
  const [imageUpload, setImageUpload] = useState(null);
  const [imageList, setImageList] = useState([]);

  const imageListRef = ref(storage, 'images/');
  // const uploadImage = () => {
  //   if (imageUpload == null) return;
  //   const imageRef = ref(storage, `images/${imageUpload.name}`);
  //   uploadBytes(imageRef, imageUpload).then((snapshot) => {
  //     getDownloadURL(snapshot.ref).then((url) => {
  //       setImageList((prev) => [...prev, url]);
  //     });
  //   });
  // };

  // useEffect(() => {
  //   listAll(imageListRef).then((response) => {
  //     response.items.forEach((item) => {
  //       getDownloadURL(item).then((url) => {
  //         setImageList((prev) => [...prev, url]);
  //         getMetadata(item).then((metadata) => {
  //           // console.log(metadata);
  //           setFiles((prev) => [
  //             ...prev,
  //             {
  //               id: `${metadata.generation}_file`,
  //               name: metadata.name,
  //               url: url,
  //               shared: [],
  //               tags: [],
  //               size: metadata.size,
  //               createdAt: metadata.timeCreated,
  //               modifiedAt: metadata.updated,
  //               type: metadata.name.split('.')[metadata.name.split('.').length - 1],
  //               isFavorited: _mock.boolean(1),
  //             },
  //           ]);
  //         });
  //       });
  //     });
  //   });
  // }, []);

  return (
    <>
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
           {/* {imageList.map((imageUrl, index) => (
        <img key={index} src={imageUrl} alt={`Image ${index}`} />
      ))} */}
  
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
                {_folders.map((folder) => (
                  <FileManagerFolderItem
                    key={folder.id}
                    folder={folder}
                    onDelete={() => console.info('DELETE', folder.id)}
                    sx={{
                      ...(_folders.length > 3 && {
                        minWidth: 222,
                      }),
                    }}
                  />
                ))}
              </Stack>
            </Scrollbar>

            <FileManagerPanel
              title="Recent Files"
              link={paths.dashboard.fileManager}
              onOpen={upload.onTrue}
              sx={{ mt: 2 }}
            />

            <Stack spacing={2}>
              {files.map((file) => (
                <FileRecentItem
                  key={file.id}
                  file={file}
                  onDelete={() => console.info('DELETE', file.id)}
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
        onCreate={handleCreateNewFolder}
      />
    </>
  );
}
