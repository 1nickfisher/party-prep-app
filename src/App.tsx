import React, { useState, useEffect } from 'react';
import './App.css';
import { db, auth } from './firebase';
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc,
  getDoc
} from 'firebase/firestore';
import {
  signInAnonymously,
  onAuthStateChanged,
  User
} from 'firebase/auth';

// Define Task interface
interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  subTasks?: Task[];
  time?: string;
}

// Define Section interface
interface Section {
  id: string;
  title: string;
  timeframe: string;
  tasks: Task[];
}

const App: React.FC = () => {
  // User state
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [partyId, setPartyId] = useState<string>('default-party');
  
  // Initial state with all tasks organized by sections
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'morning',
      title: 'Morning',
      timeframe: '9 am–12 pm',
      tasks: [
        { id: 'task1', time: '9:00 AM', text: 'Moon Bounce arrival/setup (Safety check)', isCompleted: false },
        { id: 'task2', time: '10:00 AM', text: 'Set up umbrellas for shade', isCompleted: false },
        { id: 'task3', time: '11:00 AM', text: 'Pick up ice, wine, beer', isCompleted: false },
        { id: 'task4', time: '11:30 AM', text: 'Set up drink station (cooler, ice, drinks)', isCompleted: false, 
          subTasks: [
            { id: 'sub1', text: 'Cooler: beer, wine, waters, juice boxes', isCompleted: false },
            { id: 'sub2', text: 'Cups, opener, corkscrew', isCompleted: false },
            { id: 'sub3', text: 'Ensure recycling/trash clearly labeled', isCompleted: false },
          ]
        },
      ]
    },
    {
      id: 'afternoon',
      title: 'Afternoon',
      timeframe: '12–2:30 pm',
      tasks: [
        { id: 'task5', time: '12:00 PM', text: 'Decorate backyard: balloons, banners', isCompleted: false },
        { id: 'task6', time: '12:30 PM', text: 'Set up children\'s table & chairs', isCompleted: false },
        { id: 'task7', time: '1:00 PM', text: 'Arrange seating area for adults', isCompleted: false },
        { id: 'task8', time: '1:30 PM', text: 'Drop off/set out take-home gift bags', isCompleted: false },
        { id: 'task9', time: '2:00 PM', text: 'Finalize space for food/cake setup', isCompleted: false,
          subTasks: [
            { id: 'sub4', text: 'Serving utensils (cake knife, spatula, etc.)', isCompleted: false },
            { id: 'sub5', text: 'Candles, matches/lighter ready', isCompleted: false },
          ]
        },
      ]
    },
    {
      id: 'partyStart',
      title: 'Party Start',
      timeframe: '2:30–3 pm',
      tasks: [
        { id: 'task10', time: '2:30 PM', text: 'Receive and arrange Uber Eats food & cake delivery', isCompleted: false },
        { id: 'task11', time: '2:30 PM', text: 'Quick tidy-up sweep', isCompleted: false },
        { id: 'task12', time: '2:45 PM', text: 'Music ready and playing', isCompleted: false },
      ]
    },
    {
      id: 'duringParty',
      title: 'During Party',
      timeframe: '3–5 pm',
      tasks: [
        { id: 'task13', time: '3:00 PM', text: 'Bubble performer (4-5 pm)', isCompleted: false },
        { id: 'task14', time: '4:00 PM', text: 'Cake presentation & singing', isCompleted: false },
        { id: 'task15', time: '4:30 PM', text: 'Party favors ready by exit', isCompleted: false },
      ]
    },
    {
      id: 'postParty',
      title: 'Post-party Cleanup',
      timeframe: '5 pm onward',
      tasks: [
        { id: 'task16', time: '5:00 PM', text: 'Cleanup: Gather trash/recycling', isCompleted: false },
        { id: 'task17', time: '5:15 PM', text: 'Pack leftover food, drinks, cake', isCompleted: false },
        { id: 'task18', time: '5:30 PM', text: 'Moon bounce pickup (confirm timing)', isCompleted: false },
        { id: 'task19', time: '5:45 PM', text: 'Final backyard sweep and tidy', isCompleted: false },
      ]
    },
  ]);

  // Sign in anonymously when the app loads
  useEffect(() => {
    const signInUser = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Error signing in anonymously:", error);
      }
    };

    signInUser();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check URL for party ID
  useEffect(() => {
    const url = new URL(window.location.href);
    const partyIdParam = url.searchParams.get('party');
    
    if (partyIdParam) {
      setPartyId(partyIdParam);
    }
  }, []);

  // Sync with Firestore when user is authenticated and party ID is set
  useEffect(() => {
    if (!user || !partyId) return;

    const partyRef = doc(db, 'parties', partyId);
    
    // Check if the party document exists, if not create it
    const initializeParty = async () => {
      const docSnap = await getDoc(partyRef);
      
      if (!docSnap.exists()) {
        // Create a new party with the initial sections data
        await setDoc(partyRef, { sections });
      }
    };
    
    initializeParty();
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(partyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.sections) {
          setSections(data.sections);
        }
      }
    });
    
    return () => unsubscribe();
  }, [user, partyId, sections]);

  // Toggle task completion status and update Firestore
  const toggleTaskCompletion = async (sectionId: string, taskId: string, subTaskId?: string) => {
    // First update local state
    setSections(prevSections => {
      const newSections = prevSections.map(section => {
        if (section.id !== sectionId) return section;
        
        return {
          ...section,
          tasks: section.tasks.map(task => {
            // If toggling main task
            if (task.id === taskId && !subTaskId) {
              return { ...task, isCompleted: !task.isCompleted };
            }
            
            // If toggling subtask
            if (task.id === taskId && subTaskId && task.subTasks) {
              return {
                ...task,
                subTasks: task.subTasks.map(subTask => {
                  if (subTask.id === subTaskId) {
                    return { ...subTask, isCompleted: !subTask.isCompleted };
                  }
                  return subTask;
                })
              };
            }
            
            return task;
          })
        };
      });
      
      // Update Firestore
      if (user && partyId) {
        const partyRef = doc(db, 'parties', partyId);
        updateDoc(partyRef, { sections: newSections }).catch(error => {
          console.error("Error updating document:", error);
        });
      }
      
      return newSections;
    });
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    
    sections.forEach(section => {
      section.tasks.forEach(task => {
        totalTasks++;
        if (task.isCompleted) completedTasks++;
        
        if (task.subTasks) {
          totalTasks += task.subTasks.length;
          completedTasks += task.subTasks.filter(st => st.isCompleted).length;
        }
      });
    });
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  // Generate a shareable link for the party
  const generateShareableLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?party=${partyId}`;
  };

  // Create a new party with a unique ID
  const createNewParty = () => {
    const newPartyId = 'party-' + Date.now();
    setPartyId(newPartyId);
    
    // Update URL with the new party ID
    const url = new URL(window.location.href);
    url.searchParams.set('party', newPartyId);
    window.history.pushState({}, '', url);
  };

  // Copy shareable link to clipboard
  const copyShareableLink = () => {
    const link = generateShareableLink();
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard! Share this with your party planners.');
  };

  const progress = calculateProgress();

  if (isLoading) {
    return <div className="loading">Loading party planner...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Party Prep Checklist</h1>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <span className="progress-text">{progress}% Complete</span>
        </div>
        
        <div className="collaboration-controls">
          <button onClick={copyShareableLink} className="share-button">
            Share with Collaborators
          </button>
          <button onClick={createNewParty} className="new-party-button">
            Create New Party
          </button>
        </div>
      </header>
      
      <main className="checklist-container">
        {sections.map(section => (
          <div key={section.id} className="section">
            <div className="section-header">
              <h2>{section.title}</h2>
              <span className="timeframe">{section.timeframe}</span>
            </div>
            
            <div className="task-list">
              {section.tasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-row">
                    <div className="task-time">{task.time}</div>
                    <label className="task-label">
                      <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={() => toggleTaskCompletion(section.id, task.id)}
                      />
                      <span className={task.isCompleted ? "task-text completed" : "task-text"}>
                        {task.text}
                      </span>
                    </label>
                  </div>
                  
                  {task.subTasks && task.subTasks.length > 0 && (
                    <div className="subtask-list">
                      {task.subTasks.map(subtask => (
                        <div key={subtask.id} className="subtask-item">
                          <label className="subtask-label">
                            <input
                              type="checkbox"
                              checked={subtask.isCompleted}
                              onChange={() => toggleTaskCompletion(section.id, task.id, subtask.id)}
                            />
                            <span className={subtask.isCompleted ? "subtask-text completed" : "subtask-text"}>
                              {subtask.text}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
      
      <footer className="app-footer">
        <p>Have a wonderful party! 🎉</p>
        <div className="user-info">
          {user ? <span>Connected as Guest • Party ID: {partyId}</span> : <span>Connecting...</span>}
        </div>
      </footer>
    </div>
  );
};

export default App;
