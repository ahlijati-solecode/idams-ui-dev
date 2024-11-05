import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MasterPage } from './contents';
import { CALLBACK_URL, SERVICE_URL } from './constants/serviceUrl';
import { useAuth } from './hooks';
import { setAccessTokenKey } from './libs/apiTokenHelper';
import './App.scss';

const App = () => {
  const { fetchUser } = useAuth();

  const [ready, setReady] = useState(false);

  const onMessage = async (event) => {
    if (!SERVICE_URL.startsWith(event.origin)) {
      return;
    }

    try {
      const item = JSON.parse(event.data);

      switch (item.type) {
        case 'token':
          setAccessTokenKey(item.value);
          await fetchUser();
          setReady(true);

          break;
        default:
          break;
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (document.getElementById('iframe-callback')) {
      return null;
    }

    const iframeElement = document.createElement('iframe');
    iframeElement.id = 'iframe-callback';
    iframeElement.style.display = 'none';
    iframeElement.setAttribute('src', `${CALLBACK_URL}?returnUrl=${encodeURIComponent(window.location.origin)}`);

    document.body.appendChild(iframeElement);

    window.addEventListener('message', onMessage);

    return () => {
      window.removeEventListener('message', onMessage);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return <></>;
  }

  return (
    <div className="App">
      <Routes>
        <Route path="*" element={<MasterPage />} />
      </Routes>
    </div>
  );
};

export default App;
