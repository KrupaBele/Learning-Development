import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";

interface ImageSelectionModalProps {
  open: boolean;
  onClose: () => void;
  images: string[];
  onSelectImage: (imageUrl: string) => void;
  loading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function ImageSelectionModal(props: ImageSelectionModalProps) {
  const { open, onClose, images, onSelectImage, loading, onLoadMore, hasMore } = props;

  // Ensure boolean values
  const isLoading = Boolean(loading);
  const hasMoreImages = Boolean(hasMore);

  return (
    <Dialog open={open} onClose={onClose} sx={{borderRadius:"15px"}} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Select an Image
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{borderRadius:"15px"}}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: '50vh' }}>
          {isLoading && images.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={2}>
                {images.map((imageUrl, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          transform: "scale(1.02)",
                          transition: "transform 0.2s",
                        },
                        height: '280px',
                      }}
                      onClick={() => onSelectImage(imageUrl)}
                    >
                      <CardMedia
                        component="img"
                        image={imageUrl}
                        alt={`Generated image ${index + 1}`}
                        sx={{
                          height: '100%',
                          objectFit: "cover"
                        }}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Box display="flex" justifyContent="center" mt={2} mb={2}>
                {/* Debug info */}
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                  {hasMoreImages && (
                    <Button
                      variant="contained"
                      onClick={onLoadMore}
                      disabled={isLoading}
                      sx={{ minWidth: 200 }}
                    >
                      {isLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
