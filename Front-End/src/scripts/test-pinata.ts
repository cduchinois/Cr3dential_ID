const testPinata = async () => {
  const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
  
  try {
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${pinataJWT}`
      }
    });
    
    const data = await response.json();
    console.log('Pinata Response:', data);
  } catch (error) {
    console.error('Pinata Test Error:', error);
  }
};

testPinata(); 