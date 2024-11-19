import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  TextField,
  MenuItem,
  IconButton,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Menu,
  MenuItem as MuiMenuItem,
} from "@mui/material";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { PlayArrow, Pause, Settings } from "@mui/icons-material";

const mockPredictions = ["Пшеница", "Кукуруза", "Рис", "Ячмень", "Соя"];
const mockStatuses = ["Здорово", "Инфицировано"];

function App() {
  const routes = {
    Route1: [
      [54.9788, 82.8869], // Площадь Ленина
      [55.0752, 82.9100], // Промежуточная точка
      [55.0850, 83.0100], // Зоопарк
    ],
    Route2: [
      [55.0302, 82.9204], // Площадь Ленина
      [55.045, 82.915],   // Промежуточная точка
      [55.0598, 82.8983], // Новосибирский зоопарк
    ],
  };

  const [route, setRoute] = useState(routes.Route1);
  const [currentPrediction, setCurrentPrediction] = useState("Ожидание...");
  const [isFlying, setIsFlying] = useState(false);
  const [recognizedCrops, setRecognizedCrops] = useState([]);
  const [cropSettings, setCropSettings] = useState({
    Пшеница: true,
    Кукуруза: true,
    Рис: false,
    Ячмень: true,
    Соя: false,
  });

  const [darkMode, setDarkMode] = useState(true);
  const [fpvMode, setFpvMode] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpenMenu(true);
  };

  const handleMenuClose = () => {
    setOpenMenu(false);
  };

  const handleStartFlight = () => {
    setIsFlying(true);
    const recognized = [];
    const interval = setInterval(() => {
      const crop = mockPredictions.filter((c) => cropSettings[c])[Math.floor(Math.random() * mockPredictions.filter((c) => cropSettings[c]).length)];
      const status = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
      recognized.push({ crop, status });
      setRecognizedCrops([...recognized]);
      setCurrentPrediction(crop);
    }, 2000);

    setTimeout(() => {
      setIsFlying(false);
      clearInterval(interval);
    }, 10000); // Полет длится 10 секунд
  };

  const toggleCropSetting = (crop) => {
    setCropSettings((prev) => ({
      ...prev,
      [crop]: !prev[crop],
    }));
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const toggleFpvMode = () => setFpvMode((prev) => !prev);

  return (
    <Box sx={{ backgroundColor: darkMode ? "#121212" : "#f5f5f5", color: darkMode ? "#fff" : "#000", minHeight: "100vh" }}>
      <AppBar position="static" sx={{ backgroundColor: darkMode ? "#1f1f1f" : "#2196f3" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            FPV Drone: Crop Analysis & Flight Path
          </Typography>
          <IconButton color="inherit" onClick={handleMenuClick}>
            <Settings />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
      >
        <MuiMenuItem onClick={toggleDarkMode}>
          {darkMode ? "Светлая тема" : "Темная тема"}
        </MuiMenuItem>
        <MuiMenuItem onClick={toggleFpvMode}>
          {fpvMode ? "Режим Horizon" : "Режим FPV"}
        </MuiMenuItem>
      </Menu>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, backgroundColor: darkMode ? "#1f1f1f" : "#fff" }}>
              <Typography variant="h6" gutterBottom>
                Configure Flight Path
              </Typography>
              <TextField
                fullWidth
                select
                label="Preset Routes"
                helperText="Choose a pre-defined flight route"
                sx={{ mb: 2, backgroundColor: darkMode ? "#2c2c2c" : "#f5f5f5", color: darkMode ? "#fff" : "#000" }}
                InputLabelProps={{ style: { color: darkMode ? "#fff" : "#000" } }}
                value={JSON.stringify(route)}
                onChange={(e) => setRoute(JSON.parse(e.target.value))}
              >
                <MenuItem value={JSON.stringify(routes.Route1)}>
                  Route 1: Ударная 28 → Первомайский район
                </MenuItem>
                <MenuItem value={JSON.stringify(routes.Route2)}>
                  Route 2: Площадь Ленина → Зоопарк (Alternate)
                </MenuItem>
              </TextField>

              <Typography variant="h6" gutterBottom>
                Crop Recognition Settings
              </Typography>
              <FormGroup>
                {Object.keys(cropSettings).map((crop) => (
                  <FormControlLabel
                    key={crop}
                    control={
                      <Checkbox
                        checked={cropSettings[crop]}
                        onChange={() => toggleCropSetting(crop)}
                        sx={{ color: darkMode ? "#fff" : "#000" }}
                      />
                    }
                    label={crop}
                  />
                ))}
              </FormGroup>

              <Button
                variant="contained"
                color={isFlying ? "secondary" : "primary"}
                fullWidth
                startIcon={isFlying ? <Pause /> : <PlayArrow />}
                onClick={handleStartFlight}
                disabled={isFlying}
                sx={{ mt: 2 }}
              >
                {isFlying ? "Flying..." : "Start Flight"}
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2, backgroundColor: darkMode ? "#1f1f1f" : "#fff" }}>
              <Typography variant="h6" gutterBottom>
                Flight Route Map
              </Typography>
              <MapContainer
                center={[54.9788, 82.8869]}
                zoom={13}
                style={{ height: "400px", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Polyline positions={route} color={fpvMode ? "yellow" : "blue"} />
                {route.map((point, index) => (
                  <Marker key={index} position={point} />
                ))}
              </MapContainer>
            </Paper>
          </Grid>
        </Grid>

        <Paper elevation={3} sx={{ mt: 3, p: 2, backgroundColor: darkMode ? "#1f1f1f" : "#fff" }}>
          <Typography variant="h6" gutterBottom>
            Flight Debugging & Crop Recognition
          </Typography>
          <TableContainer>
            <Table sx={{ backgroundColor: darkMode ? "#2c2c2c" : "#fff" }}>
              <TableHead>
                <TableRow>
                  <TableCell>Crop</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recognizedCrops.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.crop}</TableCell>
                    <TableCell sx={{ color: entry.status === "Здорово" ? "green" : "red" }}>
                      {entry.status}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
}

export default App;
