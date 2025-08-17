'use client';

import React, { useEffect, useState } from 'react';

function Home() {

  const [message, setMessage] = useState("Loading");
  const [people, setPeople] = useState([]);


  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/cardapio`)
      .then((response) => response.json())
      .then((data) => {
        console.log('API response:', data);
        setMessage(data.message);
        setPeople(data.people);
      })
      .catch((error) => {
        console.error('Error fetching API:', error);
      });
  }, [])

  return (
    <div>
      <h1>{message}</h1>
      <ul>
        {people.map((person, index) => (
          <li key={index}>{person}</li>
        ))}
      </ul>
    </div>
  );
}

export default Home


// MUDAR PRA AXIOS ? 
// SUBIR REPOSITÓRIO PRA GARANTIR O PROJETO.
// SUBIR EM NO RENDER ?
// PUBLICAÇÃO NO LINKEDIN DE TUDO OQ FOI FEITO ATÉ AGORA.