import React, { useState } from 'react';
import { Button, Modal, ProgressBar, Alert } from 'react-bootstrap';
import { loadAlmatyRoadNetwork } from './osm-loader';

/**
 * Компонент загрузки данных OSM
 */
const OsmDownloader = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const downloadOsmData = async () => {
    setIsDownloading(true);
    setProgress(10);
    setStatus('Начало загрузки данных OSM для Алматы...');
    setError(null);
    setSuccess(false);
    
    try {
      setProgress(30);
      setStatus('Загрузка данных с сервера Overpass API...');
      
      // Установим таймаут, чтобы показать прогресс
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Форсируем загрузку свежих данных
      await loadAlmatyRoadNetwork(true);
      
      setProgress(100);
      setStatus('Данные успешно загружены и сохранены!');
      setSuccess(true);
    } catch (error) {
      console.error('Failed to download Almaty data:', error);
      setError(error.message || 'Произошла ошибка при загрузке данных');
      setStatus('Ошибка загрузки данных');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleShow = () => {
    setShowModal(true);
    setProgress(0);
    setStatus('');
    setError(null);
    setSuccess(false);
  };

  return (
    <>
      <Button variant="outline-primary" onClick={handleShow}>
        Загрузить данные OSM
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Загрузка данных OSM для Алматы</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Это действие загрузит данные дорожной сети Алматы из OpenStreetMap и сохранит их
            в локальном хранилище браузера для офлайн-использования.
          </p>
          
          {status && <p className="my-3">{status}</p>}
          
          {isDownloading && (
            <ProgressBar animated now={progress} label={`${progress}%`} className="my-3" />
          )}
          
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success" className="mt-3">
              Данные OSM успешно загружены и сохранены в локальном хранилище!
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Закрыть
          </Button>
          <Button 
            variant="primary" 
            onClick={downloadOsmData} 
            disabled={isDownloading}
          >
            {isDownloading ? 'Загрузка...' : 'Загрузить'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OsmDownloader; 