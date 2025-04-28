document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const serversContainerEl = document.getElementById('servers-container');
  const serversListEl = document.getElementById('servers-list');
  const saveBtn = document.getElementById('save-btn');
  const selectAllBtn = document.getElementById('select-all-btn');
  const deselectAllBtn = document.getElementById('deselect-all-btn');
  const saveNotification = document.getElementById('save-notification');
  
  // Channel elements
  const noServerSelectedEl = document.getElementById('no-server-selected');
  const channelsListEl = document.getElementById('channels-list');
  const channelToolbarEl = document.querySelector('.channel-toolbar');
  const selectAllChannelsBtn = document.getElementById('select-all-channels-btn');
  const deselectAllChannelsBtn = document.getElementById('deselect-all-channels-btn');
  
  // User info elements
  const userInfoBars = document.querySelectorAll('.user-info-bar');
  const userAvatars = document.querySelectorAll('.user-avatar');
  const userNames = document.querySelectorAll('.user-name');

  // State
  let servers = [];
  let selectedServerIds = [];
  let activeServerId = null;
  let channels = {};
  let selectedChannels = {};
  let currentUser = null;

  // Fetch user information
  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      currentUser = await response.json();
      
      // Update user info UI
      updateUserInfoUI();
      
    } catch (error) {
      console.error('Error fetching user info:', error);
      userNames.forEach(el => {
        el.textContent = 'Failed to load user';
      });
    }
  };

  // Update user info UI
  const updateUserInfoUI = () => {
    if (!currentUser) return;
    
    // Show user info bars
    userInfoBars.forEach(bar => {
      bar.classList.remove('hidden');
    });
    
    // Set user name
    userNames.forEach(el => {
      el.textContent = currentUser.tag;
    });
    
    // Set user avatar
    userAvatars.forEach(avatar => {
      if (currentUser.avatar) {
        avatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.username}" />`;
      } else {
        avatar.textContent = currentUser.username.charAt(0).toUpperCase();
      }
    });
  };

  // Fetch servers from API
  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      servers = await response.json();
      
      // Get initially selected servers
      selectedServerIds = servers
        .filter(server => server.isAllowed)
        .map(server => server.id);
      
      // Get allowed servers and channels
      const settingsResponse = await fetch('/api/allowed-servers');
      if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        selectedServerIds = settings.allowedServers || [];
        selectedChannels = settings.allowedChannels || {};
      }
      
      // Render servers
      renderServers();
      
      // Show servers container
      loadingEl.classList.add('hidden');
      serversContainerEl.classList.remove('hidden');
    } catch (error) {
      console.error('Error fetching servers:', error);
      loadingEl.classList.add('hidden');
      errorEl.textContent = `Failed to load servers: ${error.message}`;
      errorEl.classList.remove('hidden');
    }
  };

  // Fetch channels for a server
  const fetchChannels = async (serverId) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/channels`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      channels[serverId] = await response.json();
      
      // If no channels are selected yet for this server, initialize with all channels (default)
      if (!selectedChannels[serverId] || selectedChannels[serverId].length === 0) {
        selectedChannels[serverId] = channels[serverId].map(channel => channel.id);
      }
      
      renderChannels(serverId);
    } catch (error) {
      console.error(`Error fetching channels for server ${serverId}:`, error);
      channelsListEl.innerHTML = `<div class="error">Failed to load channels: ${error.message}</div>`;
    }
  };

  // Render servers list
  const renderServers = () => {
    serversListEl.innerHTML = '';
    
    servers.forEach(server => {
      const isSelected = selectedServerIds.includes(server.id);
      const isActive = activeServerId === server.id;
      
      const serverCard = document.createElement('div');
      serverCard.className = `server-card ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''}`;
      serverCard.dataset.id = server.id;
      
      // Create server icon
      const serverIcon = document.createElement('div');
      serverIcon.className = 'server-icon';
      
      if (server.icon) {
        const iconImg = document.createElement('img');
        iconImg.src = server.icon;
        iconImg.alt = `${server.name} icon`;
        serverIcon.appendChild(iconImg);
      } else {
        // If no icon, use first letter of server name
        serverIcon.textContent = server.name.charAt(0).toUpperCase();
      }
      
      // Create server name and details
      const serverName = document.createElement('div');
      serverName.className = 'server-name';
      serverName.textContent = server.name;
      
      const serverDetails = document.createElement('div');
      serverDetails.className = 'server-details';
      serverDetails.textContent = `${server.memberCount} members`;
      
      // Append elements to server card
      serverCard.appendChild(serverIcon);
      serverCard.appendChild(serverName);
      serverCard.appendChild(serverDetails);
      
      // Add click handlers
      serverCard.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey) {
          // With modifier key, toggle selection regardless
          toggleServerSelection(server.id);
        } else {
          // Set this server as active (to view channels)
          setActiveServer(server.id);
          
          // Only select the server if it's not already selected
          // This prevents accidentally toggling off when just wanting to view channels
          if (!selectedServerIds.includes(server.id)) {
            selectServer(server.id);
          }
          
          // Double-click to deselect (handled separately)
        }
      });
      
      // Add double-click handler for deselection
      serverCard.addEventListener('dblclick', (e) => {
        // Double-click to toggle off a selected server
        if (selectedServerIds.includes(server.id)) {
          toggleServerSelection(server.id);
        }
      });
      
      serversListEl.appendChild(serverCard);
    });
  };

  // Render channels for a server
  const renderChannels = (serverId) => {
    channelsListEl.innerHTML = '';
    
    if (!channels[serverId] || channels[serverId].length === 0) {
      channelsListEl.innerHTML = '<div class="no-channels">No text channels found in this server</div>';
      return;
    }
    
    channels[serverId].forEach(channel => {
      // Default selection status: all channels in a selected server are selected
      const isSelected = selectedChannels[serverId]?.includes(channel.id) || false;
      
      const channelItem = document.createElement('div');
      channelItem.className = `channel-item ${isSelected ? 'selected' : ''}`;
      channelItem.dataset.id = channel.id;
      
      // Channel icon
      const channelIcon = document.createElement('div');
      channelIcon.className = 'channel-icon';
      channelIcon.textContent = '#';
      
      // Channel name
      const channelName = document.createElement('div');
      channelName.className = 'channel-name';
      channelName.textContent = channel.name;
      
      // Channel checkbox
      const channelCheckbox = document.createElement('div');
      channelCheckbox.className = 'channel-checkbox';
      
      // Append elements
      channelItem.appendChild(channelIcon);
      channelItem.appendChild(channelName);
      channelItem.appendChild(channelCheckbox);
      
      // Add click handler
      channelItem.addEventListener('click', () => {
        toggleChannelSelection(serverId, channel.id);
      });
      
      channelsListEl.appendChild(channelItem);
    });
  };

  // Set active server and load its channels
  const setActiveServer = (serverId) => {
    // Update active server
    activeServerId = serverId;
    
    // Update UI
    document.querySelectorAll('.server-card').forEach(card => {
      card.classList.toggle('active', card.dataset.id === serverId);
    });
    
    // Show channels list and toolbar
    noServerSelectedEl.classList.add('hidden');
    channelsListEl.classList.remove('hidden');
    channelToolbarEl.classList.remove('hidden');
    
    // Load channels if not already loaded
    if (!channels[serverId]) {
      fetchChannels(serverId);
    } else {
      renderChannels(serverId);
    }
  };

  // Select a server (without toggling)
  const selectServer = (serverId) => {
    if (!selectedServerIds.includes(serverId)) {
      selectedServerIds.push(serverId);
      updateServerSelectionUI(serverId);
    }
  };

  // Toggle server selection
  const toggleServerSelection = (serverId) => {
    const index = selectedServerIds.indexOf(serverId);
    
    if (index === -1) {
      // Add to selected servers
      selectedServerIds.push(serverId);
      
      // If we don't have channels for this server loaded yet, 
      // We'll default to all channels when they're loaded
    } else {
      // Remove from selected servers
      selectedServerIds.splice(index, 1);
      // Clear selected channels for this server
      delete selectedChannels[serverId];
    }
    
    // Update UI
    updateServerSelectionUI(serverId);
  };

  // Toggle channel selection
  const toggleChannelSelection = (serverId, channelId) => {
    // Initialize if not exists
    if (!selectedChannels[serverId]) {
      selectedChannels[serverId] = [];
    }
    
    const index = selectedChannels[serverId].indexOf(channelId);
    
    if (index === -1) {
      // Add to selected channels
      selectedChannels[serverId].push(channelId);
    } else {
      // Remove from selected channels
      selectedChannels[serverId].splice(index, 1);
    }
    
    // Update UI
    updateChannelSelectionUI(serverId, channelId);
  };

  // Update server selection UI
  const updateServerSelectionUI = (serverId) => {
    const serverCard = document.querySelector(`.server-card[data-id="${serverId}"]`);
    if (serverCard) {
      const isSelected = selectedServerIds.includes(serverId);
      serverCard.classList.toggle('selected', isSelected);
    }
  };

  // Update channel selection UI
  const updateChannelSelectionUI = (serverId, channelId) => {
    const channelItem = document.querySelector(`.channel-item[data-id="${channelId}"]`);
    if (channelItem) {
      const isSelected = selectedChannels[serverId]?.includes(channelId) || false;
      channelItem.classList.toggle('selected', isSelected);
    }
  };

  // Save server and channel settings
  const saveSettings = async () => {
    try {
      // Filter selectedChannels to only include selected servers
      const channelsToSave = {};
      selectedServerIds.forEach(serverId => {
        channelsToSave[serverId] = selectedChannels[serverId] || [];
      });
      
      const response = await fetch('/api/server-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          servers: selectedServerIds,
          channels: channelsToSave
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const result = await response.json();
      
      // Show save notification
      saveNotification.classList.remove('hidden');
      setTimeout(() => {
        saveNotification.classList.add('hidden');
      }, 3000);
      
      // Update state
      selectedServerIds = result.allowedServers;
      selectedChannels = result.allowedChannels;
      
      // Update UI
      renderServers();
      if (activeServerId) {
        renderChannels(activeServerId);
      }
      
    } catch (error) {
      console.error('Error saving settings:', error);
      errorEl.textContent = `Failed to save: ${error.message}`;
      errorEl.classList.remove('hidden');
    }
  };

  // Select all servers
  const selectAllServers = () => {
    selectedServerIds = servers.map(server => server.id);
    renderServers();
  };

  // Deselect all servers
  const deselectAllServers = () => {
    selectedServerIds = [];
    selectedChannels = {};
    renderServers();
  };

  // Select all channels for active server
  const selectAllChannels = () => {
    if (!activeServerId || !channels[activeServerId]) return;
    
    selectedChannels[activeServerId] = channels[activeServerId].map(channel => channel.id);
    renderChannels(activeServerId);
  };

  // Deselect all channels for active server
  const deselectAllChannels = () => {
    if (!activeServerId) return;
    
    selectedChannels[activeServerId] = [];
    renderChannels(activeServerId);
  };

  // Event listeners
  saveBtn.addEventListener('click', saveSettings);
  selectAllBtn.addEventListener('click', selectAllServers);
  deselectAllBtn.addEventListener('click', deselectAllServers);
  selectAllChannelsBtn.addEventListener('click', selectAllChannels);
  deselectAllChannelsBtn.addEventListener('click', deselectAllChannels);

  // Initialize
  fetchUserInfo();
  fetchServers();
}); 