"use client";
import FileUploadComponent from "@/components/FileUploadComponent";
import {
  Button,
  Card,
  Container,
  Grid,
  Image as MantineImage,
  Modal,
  NumberInput,
  Select,
  Text,
  Title
} from '@mantine/core';
import { useDisclosure } from "@mantine/hooks";
import {
  IconCheck,
  IconCrop,
  IconPlayerPlay,
  IconPlayerStop,
  IconTrash,
  IconX,
  IconDownload
} from '@tabler/icons-react';
import 'cropperjs/dist/cropper.css';
import React, { useEffect, useRef, useState } from 'react';
import { Cropper } from 'react-cropper';

const MediaEditor = () => {
  // State management
  const [media, setMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(10);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploadModalOpened, { open: openUploadModal, close: closeUploadModal }] = useDisclosure(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [tempChanges, setTempChanges] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const cropperRef = useRef(null);
  const timerRef = useRef(null);
  const slideTimerRef = useRef(null);

  const handleMediaUpload = (files) => {
    if (files) {
      const newMedia = files.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
        originalWidth: 300,
        originalHeight: 200,
        width: 300,
        height: 200,
        duration: 3,
        startTime: 0,
        endTime: 3,
        aspectRatio: "original",
        crop: null,
      }));
      setMedia((prev) => [...prev, ...newMedia]);
      closeUploadModal();

      if (!selectedMedia && newMedia.length > 0) {
        setSelectedMedia(newMedia[0]);
      }
    }
  };

  const handleMediaSelect = (item) => {
    if (isPlaying) {
      handleStop();
    }

    if (unsavedChanges && selectedMedia) {
      if (!window.confirm("You have unsaved changes. Discard them?")) {
        return;
      }
      setUnsavedChanges(false);
      setTempChanges(null);
    }
    setSelectedMedia(item);
    setIsCropping(false);
  };

  const updateTempChanges = (updates) => {
    if (selectedMedia) {
      setTempChanges((prev) => ({ ...prev, ...updates }));
      setUnsavedChanges(true);
    }
  };

  const saveChanges = () => {
    if (selectedMedia && tempChanges) {
      const updatedMedia = { ...selectedMedia, ...tempChanges };

      if (tempChanges.crop && !tempChanges.width && !tempChanges.height) {
        updatedMedia.width = tempChanges.crop.width;
        updatedMedia.height = tempChanges.crop.height;
      }

      setMedia((prev) =>
        prev.map((item) => (item.id === selectedMedia.id ? updatedMedia : item))
      );
      setSelectedMedia(updatedMedia);
      setUnsavedChanges(false);
      setTempChanges(null);
      setIsCropping(false);
    }
  };

  const discardChanges = () => {
    setUnsavedChanges(false);
    setTempChanges(null);
    setIsCropping(false);
  };

  const handleAspectRatioChange = (ratio) => {
    if (!selectedMedia) return;

    let newWidth, newHeight;
    switch (ratio) {
      case "16:9":
        newWidth = 300;
        newHeight = 169;
        break;
      case "4:3":
        newWidth = 300;
        newHeight = 225;
        break;
      case "1:1":
        newWidth = 300;
        newHeight = 300;
        break;
      default: // original
        newWidth = selectedMedia.originalWidth;
        newHeight = selectedMedia.originalHeight;
    }

    updateTempChanges({
      width: newWidth,
      height: newHeight,
      aspectRatio: ratio,
      crop: null, // Reset crop when aspect ratio changes
    });
  };

  const handleWidthChange = (val) => {
    if (!selectedMedia) return;
    
    const newWidth = Math.max(50, Math.min(val, 1000));
    
    // Maintain aspect ratio proportionally
    const originalAspectRatio = selectedMedia.originalHeight / selectedMedia.originalWidth;
    const newHeight = Math.round(newWidth * originalAspectRatio);

    updateTempChanges({
      width: newWidth,
      height: newHeight,
      aspectRatio: "custom",
      crop: null,
    });
  };

  const handleHeightChange = (val) => {
    if (!selectedMedia) return;
    
    const newHeight = Math.max(50, Math.min(val, 1000));
    
    // Maintain aspect ratio proportionally
    const originalAspectRatio = selectedMedia.originalWidth / selectedMedia.originalHeight;
    const newWidth = Math.round(newHeight * originalAspectRatio);

    updateTempChanges({
      width: newWidth,
      height: newHeight,
      aspectRatio: "custom",
      crop: null,
    });
  };

  const handleDurationChange = (val) => {
    if (!selectedMedia) return;
    
    const newDuration = Math.max(1, Math.min(val, 30));
    
    updateTempChanges({
      duration: newDuration,
    });
  };
  const handleCrop = () => {
    if (!selectedMedia || !cropperRef.current) return;
  
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      // Get cropped canvas to ensure we have the actual cropped image
      const croppedCanvas = cropper.getCroppedCanvas();
      
      if (croppedCanvas) {
        // Convert cropped canvas to a data URL
        const croppedImageUrl = croppedCanvas.toDataURL(selectedMedia.type);
  
        updateTempChanges({
          url: croppedImageUrl, // Update the image URL with cropped version
          width: croppedCanvas.width,
          height: croppedCanvas.height,
          crop: {
            x: Math.round(cropper.getData().x),
            y: Math.round(cropper.getData().y),
            width: Math.round(cropper.getData().width),
            height: Math.round(cropper.getData().height),
          },
          aspectRatio: "custom",
        });
  
        setIsCropping(false);
      }
    }
  };
  

  const removeMediaItem = (id) => {
    setMedia((prev) => {
      // Clean up the URL
      const itemToRemove = prev.find((item) => item.id === id);
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.url);
      }

      const newMedia = prev.filter((item) => item.id !== id);

      // Handle selected media
      if (selectedMedia && selectedMedia.id === id) {
        setSelectedMedia(newMedia.length > 0 ? newMedia[0] : null);
        setUnsavedChanges(false);
        setTempChanges(null);
      }

      // Handle playback
      if (isPlaying && media[currentIndex]?.id === id) {
        handleStop();
      }

      // Adjust current index
      const removedIndex = prev.findIndex((item) => item.id === id);
      if (removedIndex !== -1 && removedIndex <= currentIndex) {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      }

      return newMedia;
    });
  };

  const handlePlay = () => {
    if (media.length === 0) return;

    setIsPlaying(true);
    setCurrentTime(0);
    setCurrentIndex(0);

    timerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= totalDuration) {
          handleStop();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    const mediaDuration = totalDuration / media.length;
    slideTimerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % media.length;
        return nextIndex;
      });
    }, mediaDuration * 1000);
  };

  const handleStop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentIndex(0);
  };

  const getCurrentValue = (key) => {
    if (unsavedChanges && tempChanges && tempChanges[key] !== undefined) {
      return tempChanges[key];
    }
    return selectedMedia ? selectedMedia[key] : null;
  };

  useEffect(() => {
    return () => {
      media.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [media]);


  const downloadMedia = async () => {
    // Check if there's media to download
    if (media.length === 0) {
      alert("No media to download");
      return;
    }
  
    try {
      // For single media item
      if (media.length === 1) {
        const mediaItem = media[0];
        await downloadSingleMedia(mediaItem);
        return;
      }
  
      // For multiple media items
      await downloadMultipleMedia();
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download media. Please try re-uploading the files.");
    }
  };
  
  const downloadSingleMedia = async (mediaItem) => {
    try {
      // Re-fetch the media data from the original file if possible
      const originalFile = await fetchOriginalFile(mediaItem);
      
      if (!originalFile) {
        throw new Error("Could not retrieve original file");
      }
  
      // Determine file extension based on media type
      const extension = mediaItem.type === 'video' ? '.mp4' : '.jpg';
      const filename = `edited_media${extension}`;
  
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(originalFile);
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Single media download error:", error);
      alert("Failed to download single media file");
    }
  };
  
  const downloadMultipleMedia = async () => {
    try {
      // Create a zip file for multiple media
      const JSZip = await import('jszip');
      const zip = new JSZip.default();
  
      // Add each media item to the zip
      await Promise.all(media.map(async (mediaItem, index) => {
        // Re-fetch the original file
        const originalFile = await fetchOriginalFile(mediaItem);
        
        if (!originalFile) {
          throw new Error(`Could not retrieve file for media item ${index + 1}`);
        }
        
        // Determine file extension
        const extension = mediaItem.type === 'video' ? '.mp4' : '.jpg';
        zip.file(`media_${index + 1}${extension}`, originalFile);
      }));
  
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
  
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = 'edited_media.zip';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Multiple media download error:", error);
      alert("Failed to download multiple media files");
    }
  };
  
  // Helper function to retrieve original file
  const fetchOriginalFile = async (mediaItem) => {
    try {
      // If the URL is a blob URL, we can't directly fetch it
      // In this case, you'll need to store the original File object when uploading
      const response = await fetch(mediaItem.url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch media");
      }
      
      return await response.blob();
    } catch (error) {
      console.error("Error fetching original file:", error);
      return null;
    }
  }


  // Rendering methods
  const renderResizeSection = () => (
    <Card 
      shadow="sm"
      padding="md"
      className="bg-blue-50 rounded-lg border border-blue-200 mb-4"
    >
      <Title order={5} mb="md" className="text-blue-800">Resize Media</Title>
      <Select
        label="Aspect Ratio"
        data={[
          { value: "original", label: "Original" },
          { value: "16:9", label: "16:9" },
          { value: "4:3", label: "4:3" },
          { value: "1:1", label: "1:1" },
        ]}
        value={getCurrentValue('aspectRatio') || "original"}
        onChange={handleAspectRatioChange}
        mt="md"
        disabled={!selectedMedia}
      />
      <NumberInput
        label="Width"
        value={getCurrentValue('width') || 300}
        onChange={handleWidthChange}
        min={50}
        max={1000}
        mt="md"
        disabled={!selectedMedia}
      />
      <NumberInput
        label="Height"
        value={getCurrentValue('height') || 200}
        onChange={handleHeightChange}
        min={50}
        max={1000}
        mt="md"
        disabled={!selectedMedia}
      />
    </Card>
  );

  const renderCropSection = () => (
    <Card 
      shadow="sm"
      padding="md"
      className="bg-blue-50 rounded-lg border border-blue-200 mb-4"
    >
      <Title order={5} mb="md" className="text-blue-800">Crop Media</Title>
      {selectedMedia && selectedMedia.type === "image" && (
        <div className="mt-4">
          {isCropping ? (
            <>
              <Cropper
                ref={cropperRef}
                src={selectedMedia.url}
                style={{ height: 400, width: "100%" }}
                // Add more precise cropper options
                viewMode={1}
                dragMode="move"
                aspectRatio={NaN} // Allow free aspect ratio
                guides={true}
                background={true}
                highlight={true}
                cropBoxResizable={true}
                zoomable={true}
              />
              <div className="flex justify-center space-x-4 mt-4">
                <Button 
                  onClick={handleCrop}
                  color="blue"
                >
                  Apply Crop
                </Button>
                <Button 
                  variant="outline" 
                  color="red"
                  onClick={() => setIsCropping(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={() => setIsCropping(true)}
              fullWidth
              leftSection={<IconCrop size={14} />}
              disabled={selectedMedia?.type === "video"}
            >
              Open Cropper
            </Button>
          )}
        </div>
      )}
    </Card>
  );
  


  const renderDurationSection = () => (
    <Card 
      shadow="sm"
      padding="md"
      className="bg-blue-50 rounded-lg border border-blue-200 mb-4"
    >
      <Title order={5} mb="md" className="text-blue-800">Media Duration</Title>
      <NumberInput
        label="Duration (seconds)"
        value={getCurrentValue('duration') || 3}
        onChange={handleDurationChange}
        min={1}
        max={30}
        mt="md"
        disabled={!selectedMedia}
      />
    </Card>
  );

  return (
    <Container fluid className="bg-blue-50 min-h-screen p-6">
      <Modal
        opened={uploadModalOpened}
        onClose={() => {}}
        title="Upload Media to Begin"
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
        centered
        className="bg-white rounded-lg shadow-xl"
      >
        <FileUploadComponent onFileUpload={handleMediaUpload} />
      </Modal>
      <Grid className="gap-6">
        <Grid.Col span={3}>
          <Card 
            shadow="sm" 
            padding="lg" 
            className="bg-white rounded-xl border border-blue-100 shadow-md"
          >
            <Title order={3} mb="md" className="text-blue-800 font-bold">
              Media Editor
            </Title>

            {/* File Upload Component */}
            <div className="mb-4">
              <Button 
                component="label" 
                fullWidth 
                variant="filled" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Upload Media
                <input 
                  type="file" 
                  hidden 
                  multiple 
                  accept="image/*,video/*"
                  onChange={(e) => handleMediaUpload(Array.from(e.target.files))}
                />
              </Button>
            </div>

            {/* Always visible editing sections */}
            {renderResizeSection()}
            {renderCropSection()}
            {renderDurationSection()}

            {unsavedChanges && (
              <div className="flex space-x-4 mt-4">
                <Button
                  color="blue"
                  fullWidth
                  leftSection={<IconCheck size={14} />}
                  onClick={saveChanges}
                >
                  Save Changes
                </Button>
                <Button
                  color="red"
                  variant="outline"
                  fullWidth
                  leftSection={<IconX size={14} />}
                  onClick={discardChanges}
                >
                  Discard
                </Button>
              </div>
            )}

            <NumberInput
              label="Total Slideshow Duration (seconds)"
              value={totalDuration}
              onChange={(val) => setTotalDuration(val || 10)}
              min={1}
              max={300}
              mt="md"
            />

            <div className="flex justify-center space-x-4 mt-4">
              <Button
                onClick={handlePlay}
                disabled={media.length === 0}
                leftSection={<IconPlayerPlay size={14} />}
              >
                Play
              </Button>
              <Button
                onClick={handleStop}
                disabled={!isPlaying}
                color="red"
                leftSection={<IconPlayerStop size={14} />}
              >
                Stop
              </Button>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
            <Button
              onClick={downloadMedia}
              color="green"
              leftSection={<IconDownload size={14} />}
              disabled={media.length === 0}
            >
              Download Media
            </Button>
          </div>
          </Card>
        </Grid.Col>

        <Grid.Col span={9}>
          <Card
            shadow="sm"
            padding="lg"
            className="bg-white rounded-xl border border-blue-100 shadow-md"
          >
            {/* Media Preview Section */}
            <div className="relative w-full aspect-video flex justify-center items-center bg-blue-50 rounded-lg overflow-hidden">
              {media.length > 0 ? (
                <div className="relative w-full h-full">
                  {media.map((item, index) => (
                    <div
                      key={item.id}
                      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                        index === currentIndex ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {item.type === "video" ? (
                        <video
                          src={item.url}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                          autoPlay={isPlaying && index === currentIndex}
                          muted
                          controls={!isPlaying}
                        />
                      ) : (
                        <MantineImage
                          src={item.url}
                          alt="Media Preview"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Text size="lg" c="dimmed">
                  No media uploaded yet
                </Text>
              )}
            </div>

            {/* Media Library Section */}
            {media.length > 0 && (
              <div className="mt-4 space-y-4">
                <Title order={4} className="text-blue-800">
                  Media Library
                </Title>
                <div className="grid grid-cols-4 gap-4">
                  {media.map((item, index) => (
                    <div
                      key={item.id}
                      className={`
                        relative cursor-pointer 
                        rounded-lg 
                        border-2 
                        overflow-hidden
                        transition-all duration-300
                        ${index === currentIndex ? 'border-blue-500' : 'border-transparent'}
                        ${selectedMedia?.id === item.id ? 'ring-2 ring-green-500' : ''}
                        hover:shadow-lg
                      `}
                      onClick={() => {
                        handleMediaSelect(item);
                        setCurrentIndex(index);
                      }}
                    >
                      {item.type === "video" ? (
                        <video
                          src={item.url}
                          className="w-full h-24 object-cover"
                        />
                      ) : (
                        <MantineImage
                          src={item.url}
                          alt="Thumbnail"
                          className="w-full h-24 object-cover"
                        />
                      )}
                      <Button
                        color="red"
                        variant="light"
                        size="xs"
                        className="absolute top-1 right-1 bg-red-50 text-red-500 hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMediaItem(item.id);
                        }}
                      >
                        <IconTrash size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default MediaEditor;