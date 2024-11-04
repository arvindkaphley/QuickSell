import React, { useState, useEffect } from 'react';

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState(() => {
    return localStorage.getItem('grouping') || 'status';
  });
  const [ordering, setOrdering] = useState(() => {
    return localStorage.getItem('ordering') || 'priority';
  });
  const [isDisplayMenuOpen, setIsDisplayMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.quicksell.co/v1/internal/frontend-assignment');
      const data = await response.json();
      console.log('Fetched data:', data); // Debug log
      setTickets(data.tickets);
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Debug logs
  useEffect(() => {
    console.log('Current tickets:', tickets);
    console.log('Current users:', users);
    console.log('Current grouping:', grouping);
    console.log('Current ordering:', ordering);
  }, [tickets, users, grouping, ordering]);

  const priorityMap = {
    4: { label: 'Urgent', icon: '🔴' },
    3: { label: 'High', icon: '🟡' },
    2: { label: 'Medium', icon: '🟢' },
    1: { label: 'Low', icon: '⚪' },
    0: { label: 'No priority', icon: '⚫' }
  };

  const statusIcons = {
    'Backlog': '📋',
    'Todo': '📝',
    'In progress': '🔄',
    'Done': '✅',
    'Canceled': '❌'
  };

  const groupTickets = () => {
    if (!tickets.length) return []; // Return empty array if no tickets

    const sortedTickets = [...tickets].sort((a, b) => {
      if (ordering === 'priority') {
        return b.priority - a.priority;
      }
      return a.title.localeCompare(b.title);
    });

    switch (grouping) {
      case 'status': {
        const statusGroups = {};
        sortedTickets.forEach(ticket => {
          if (!statusGroups[ticket.status]) {
            statusGroups[ticket.status] = [];
          }
          statusGroups[ticket.status].push(ticket);
        });
        return Object.entries(statusGroups).map(([status, groupTickets]) => ({
          title: status,
          icon: statusIcons[status] || '📋',
          tickets: groupTickets
        }));
      }

      case 'user': {
        const userGroups = {};
        sortedTickets.forEach(ticket => {
          const user = users.find(u => u.id === ticket.userId);
          if (!userGroups[ticket.userId]) {
            userGroups[ticket.userId] = {
              name: user?.name || 'Unassigned',
              tickets: []
            };
          }
          userGroups[ticket.userId].tickets.push(ticket);
        });
        return Object.entries(userGroups).map(([userId, data]) => ({
          title: data.name,
          icon: '👤',
          tickets: data.tickets
        }));
      }

      case 'priority': {
        const priorityGroups = {};
        sortedTickets.forEach(ticket => {
          if (!priorityGroups[ticket.priority]) {
            priorityGroups[ticket.priority] = [];
          }
          priorityGroups[ticket.priority].push(ticket);
        });
        return Object.entries(priorityGroups)
          .sort((a, b) => b[0] - a[0])
          .map(([priority, groupTickets]) => ({
            title: priorityMap[priority].label,
            icon: priorityMap[priority].icon,
            tickets: groupTickets
          }));
      }

      default:
        return [];
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mb-4 relative">
        <button
          onClick={() => setIsDisplayMenuOpen(!isDisplayMenuOpen)}
          className="bg-white px-4 py-2 rounded-md shadow flex items-center gap-2"
        >
          <span>Display</span>
          <span className="text-xs">▼</span>
        </button>

        {isDisplayMenuOpen && (
          <div className="absolute top-full mt-2 bg-white rounded-md shadow-lg p-4 z-10">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Grouping</label>
              <select
                value={grouping}
                onChange={(e) => setGrouping(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="status">Status</option>
                <option value="user">User</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ordering</label>
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {groupTickets().map((group, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span>{group.icon}</span>
                <span className="font-medium">{group.title}</span>
                <span className="text-gray-500">{group.tickets.length}</span>
              </div>
              <button className="text-gray-500">+</button>
            </div>
            <div className="space-y-2">
              {group.tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500">{ticket.id}</span>
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                      {users.find(u => u.id === ticket.userId)?.name.charAt(0)}
                    </div>
                  </div>
                  <h3 className="font-medium mb-2">{ticket.title}</h3>
                  <div className="flex items-center gap-2">
                    <span>{priorityMap[ticket.priority].icon}</span>
                    <div className="border rounded px-2 py-1 text-xs text-gray-600">
                      {ticket.tag[0]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;