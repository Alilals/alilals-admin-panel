"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/Page-header";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { format } from "date-fns";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

import {
  db,
  addTaskToUser,
  deleteTaskFromUser,
} from "@/lib/firebase-notifications-util";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const NotificationCalendar = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { projectId } = params;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [events, setEvents] = useState([]);

  // Find user by projectId field
  useEffect(() => {
    const findUserByProjectId = async () => {
      if (!projectId) return;

      try {
        setUserLoading(true);
        setUserError(null);

        const { collection, query, where, getDocs } = await import(
          "firebase/firestore"
        );
        const usersQuery = query(
          collection(db, "users"),
          where("projectId", "==", projectId)
        );

        const querySnapshot = await getDocs(usersQuery);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = { id: userDoc.id, ...userDoc.data() };
          setUser(userData);

          // Convert tasks to calendar events
          if (userData.tasks) {
            const calendarEvents = [];
            Object.keys(userData.tasks).forEach((dateKey) => {
              userData.tasks[dateKey].forEach((task) => {
                const taskDate = new Date(dateKey + "T00:00:00");
                calendarEvents.push({
                  id: task.id,
                  title: task.title,
                  start: taskDate,
                  end: taskDate,
                  allDay: true,
                  resource: {
                    ...task,
                    date: dateKey,
                  },
                });
              });
            });
            setEvents(calendarEvents);
          }
        } else {
          setUserError("User not found");
          toast({
            title: "Error",
            description: "User not found.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error finding user:", error);
        setUserError(error.message);
        toast({
          title: "Error",
          description: "Failed to find user.",
          variant: "destructive",
        });
      } finally {
        setUserLoading(false);
      }
    };

    findUserByProjectId();
  }, [projectId, router, toast]);

  const formatDateKey = (date) => {
    return format(date, "yyyy-MM-dd");
  };

  const getTasksForDate = (date) => {
    if (!user || !user.tasks) return [];
    const dateKey = formatDateKey(date);
    return user.tasks[dateKey] || [];
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a task title.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "User not found.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const dateKey = formatDateKey(selectedDate);
      const newTaskData = await addTaskToUser(user.id, dateKey, newTask);

      // Update local state with the actual task data returned from Firebase
      const updatedTasks = { ...user.tasks };
      if (!updatedTasks[dateKey]) {
        updatedTasks[dateKey] = [];
      }
      updatedTasks[dateKey].push(newTaskData);

      setUser({ ...user, tasks: updatedTasks });

      // Add new event to calendar
      const taskDate = new Date(dateKey + "T00:00:00");
      const newEvent = {
        id: newTaskData.id,
        title: newTaskData.title,
        start: taskDate,
        end: taskDate,
        allDay: true,
        resource: {
          ...newTaskData,
          date: dateKey,
        },
      };
      setEvents([...events, newEvent]);

      setNewTask({ title: "", description: "" });
      setAddTaskDialogOpen(false);
      setTaskDialogOpen(true); // Reopen the task list dialog to show the new task

      toast({
        title: "Success",
        description: "Task added successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setLoading(true);
    try {
      const dateKey = formatDateKey(selectedDate);
      await deleteTaskFromUser(user.id, dateKey, taskId);

      // Update local state
      const updatedTasks = { ...user.tasks };
      if (updatedTasks[dateKey]) {
        updatedTasks[dateKey] = updatedTasks[dateKey].filter(
          (task) => task.id !== taskId
        );
        if (updatedTasks[dateKey].length === 0) {
          delete updatedTasks[dateKey];
        }
      }

      setUser({ ...user, tasks: updatedTasks });

      // Remove event from calendar
      setEvents(events.filter((event) => event.id !== taskId));

      toast({
        title: "Success",
        description: "Task deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setTaskDialogOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedDate(event.start);
    setTaskDialogOpen(true);
  };

  const handleDateNavigation = (year, month) => {
    const newDate = new Date(year, month, 1);
    setCurrentDate(newDate);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  const generateMonthOptions = () => {
    return [
      { value: 0, label: "January" },
      { value: 1, label: "February" },
      { value: 2, label: "March" },
      { value: 3, label: "April" },
      { value: 4, label: "May" },
      { value: 5, label: "June" },
      { value: 6, label: "July" },
      { value: 7, label: "August" },
      { value: 8, label: "September" },
      { value: 9, label: "October" },
      { value: 10, label: "November" },
      { value: 11, label: "December" },
    ];
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="w-12 h-12 border-4 border-green-400 border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="text-gray-500 text-xl">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="">
          <PageHeader title={`Notification Center - ${user.projectId}`} />
        </div>
      </div>

      <div className="m-4">
        <Link href={`/admin/notifications/${user.projectId}`}>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </Link>
      </div>

      {/* Calendar Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="bg-white rounded-lg shadow-lg border border-gray-200"
          style={{ height: "calc(100vh - 200px)" }}
        >
          {/* Custom Navigation */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Year:
                </label>
                <select
                  value={currentDate.getFullYear()}
                  onChange={(e) =>
                    handleDateNavigation(
                      parseInt(e.target.value),
                      currentDate.getMonth()
                    )
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {generateYearOptions().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Month:
                </label>
                <select
                  value={currentDate.getMonth()}
                  onChange={(e) =>
                    handleDateNavigation(
                      currentDate.getFullYear(),
                      parseInt(e.target.value)
                    )
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {generateMonthOptions().map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "calc(100% - 80px)", padding: "20px" }}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            popup
            views={["month"]}
            view="month"
            onView={() => {}} // Disable view changes
            date={currentDate}
            onNavigate={() => {}} // Disable navigation
            toolbar={false} // Hide the default toolbar
            step={60}
            showMultiDayTimes
            eventPropGetter={() => ({
              style: {
                backgroundColor: "#10b981",
                borderColor: "#059669",
                color: "white",
                borderRadius: "4px",
                border: "none",
                padding: "2px 5px",
                fontSize: "12px",
              },
            })}
            dayPropGetter={(date) => ({
              style: {
                backgroundColor: moment(date).isSame(moment(), "day")
                  ? "#f0fdf4"
                  : "white",
              },
            })}
          />
        </div>
      </div>

      {/* Task List Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Tasks for {format(selectedDate, "MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Add Task Button */}
            <button
              onClick={() => {
                setTaskDialogOpen(false);
                setAddTaskDialogOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>

            {/* Task List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {getTasksForDate(selectedDate).length > 0 ? (
                getTasksForDate(selectedDate).map((task) => (
                  <div key={task.id} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={loading}
                        className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No tasks for this date
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={addTaskDialogOpen} onOpenChange={setAddTaskDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Add Task for {format(selectedDate, "MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                placeholder="Enter task description (optional)"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setAddTaskDialogOpen(false);
                  setNewTask({ title: "", description: "" });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Adding..." : "Add Task"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationCalendar;
