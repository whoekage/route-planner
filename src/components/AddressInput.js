import React, { useState } from 'react';
import { Form, Button, ListGroup, Alert } from 'react-bootstrap';

const AddressInput = ({ onAddressesSubmit, isLoading }) => {
  const [addresses, setAddresses] = useState(['']);
  const [error, setError] = useState('');

  // Add a new empty address input
  const addAddressField = () => {
    setAddresses([...addresses, '']);
  };

  // Update an address at a specific index
  const updateAddress = (index, value) => {
    const newAddresses = [...addresses];
    newAddresses[index] = value;
    setAddresses(newAddresses);
  };

  // Remove an address at a specific index
  const removeAddress = (index) => {
    const newAddresses = [...addresses];
    newAddresses.splice(index, 1);
    setAddresses(newAddresses);
  };

  // Reset all addresses
  const resetAddresses = () => {
    setAddresses(['']);
    setError('');
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty addresses
    const filteredAddresses = addresses.filter(address => address.trim() !== '');
    
    if (filteredAddresses.length < 2) {
      setError('Please enter at least 2 addresses');
      return;
    }
    
    setError('');
    onAddressesSubmit(filteredAddresses);
  };

  return (
    <div>
      <h3>Enter Addresses in Almaty</h3>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <ListGroup className="address-list mb-3">
          {addresses.map((address, index) => (
            <ListGroup.Item key={index} className="d-flex align-items-center">
              <Form.Control
                type="text"
                placeholder={`Address ${index + 1}`}
                value={address}
                onChange={(e) => updateAddress(index, e.target.value)}
                disabled={isLoading}
                required={index === 0} // First address is required
              />
              {addresses.length > 1 && (
                <Button 
                  variant="outline-danger" 
                  className="ms-2" 
                  onClick={() => removeAddress(index)}
                  disabled={isLoading}
                >
                  ×
                </Button>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
        
        <div className="d-flex gap-2 mb-4">
          <Button 
            variant="outline-primary" 
            onClick={addAddressField}
            disabled={isLoading}
          >
            + Add Address
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={resetAddresses}
            disabled={isLoading}
          >
            Reset
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Calculating...' : 'Calculate Route'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddressInput; 