"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/Page-header";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { format } from "date-fns";
import { Plus, Trash2, ArrowLeft, Eye, Download } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format as formatDateFns } from "date-fns";

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
  const [viewTaskDialogOpen, setViewTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [events, setEvents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsError, setSmsError] = useState(null);
  const [taskToSendSms, setTaskToSendSms] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // New task state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    sendNotification: "no",
    selectedTemplate: "",
    templateVariables: [],
    scheduleDate: null,
    scheduleTime: "",
  });

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
            className: "bg-red-500 text-white border border-red-700",
          });
        }
      } catch (error) {
        console.error("Error finding user:", error);
        setUserError(error.message);
        toast({
          title: "Error",
          description: "Failed to find user.",
          className: "bg-red-500 text-white border border-red-700",
        });
      } finally {
        setUserLoading(false);
      }
    };

    findUserByProjectId();
  }, [projectId, router, toast]);

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setTemplatesLoading(true);
        const response = await fetch("/api/get-templates?dltHeader=ZIRAAT");
        const data = await response.json();

        if (data.ZIRAAT) {
          setTemplates(data.ZIRAAT);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast({
          title: "Error",
          description: "Failed to fetch SMS templates.",
          className: "bg-red-500 text-white border border-red-700",
        });
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchTemplates();
  }, [toast]);

  const formatDateKey = (date) => {
    return format(date, "yyyy-MM-dd");
  };

  const getTasksForDate = (date) => {
    if (!user || !user.tasks) return [];
    const dateKey = formatDateKey(date);
    return user.tasks[dateKey] || [];
  };

  const getSelectedTemplate = () => {
    return templates.find((t) => t.template_id === newTask.selectedTemplate);
  };

  // Replace all {##} with input fields and preview logic
  const parseTemplateVariables = (templateText) => {
    // Find all {##} variables and extract their labels
    const regex = /\{#(.*?)#\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(templateText)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  };

  const replaceTemplateVariables = (templateText, variables) => {
    // Replace each {#label#} with the corresponding variable value or the placeholder
    let result = templateText;
    const regex = /\{#(.*?)#\}/g;
    let varIndex = 0;
    result = result.replace(regex, (_, label) => {
      const value = variables[varIndex];
      varIndex++;
      return value && value.trim() !== "" ? value : `{#${label}#}`;
    });
    return result;
  };

  const generateVariableFields = () => {
    const template = getSelectedTemplate();
    if (!template) return [];
    const labels = parseTemplateVariables(template.template);
    return labels.map((label, i) => ({
      id: i,
      label,
      value: newTask.templateVariables[i] || "",
    }));
  };

  const handleTemplateChange = (templateId) => {
    const template = templates.find((t) => t.template_id === templateId);
    const variableCount = template ? template["variable-count"] : 0;

    setNewTask((prev) => ({
      ...prev,
      selectedTemplate: templateId,
      templateVariables: new Array(variableCount).fill(""),
    }));
  };

  const handleVariableChange = (index, value) => {
    setNewTask((prev) => ({
      ...prev,
      templateVariables: prev.templateVariables.map((v, i) =>
        i === index ? value : v
      ),
    }));
  };

  const resetNewTaskForm = () => {
    setNewTask({
      title: "",
      description: "",
      sendNotification: "no",
      selectedTemplate: "",
      templateVariables: [],
      scheduleDate: null,
      scheduleTime: "",
    });
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a task title.",
        className: "bg-red-500 text-white border border-red-700",
      });
      return;
    }

    // Validate schedule date is not in the past
    if (newTask.sendNotification === "yes" && newTask.scheduleDate) {
      const now = new Date();
      if (newTask.scheduleDate <= now) {
        toast({
          title: "Validation Error",
          description:
            "Schedule date and time cannot be in the past. Please select a future date and time.",
          className: "bg-red-500 text-white border border-red-700",
        });
        return;
      }
    }

    if (!user) {
      toast({
        title: "Error",
        description: "User not found.",
        className: "bg-red-500 text-white border border-red-700",
      });
      return;
    }

    setLoading(true);
    try {
      const dateKey = formatDateKey(selectedDate);

      // Prepare task data
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        sendNotification: newTask.sendNotification,
      };

      // Add SMS data if notification is enabled
      if (newTask.sendNotification === "yes") {
        const template = getSelectedTemplate();
        if (template) {
          // Replace template variables with actual values before storing
          const processedTemplateText = replaceTemplateVariables(
            template.template,
            newTask.templateVariables
          );

          taskData.template_id = template.template_id;
          taskData.template_title = template.title;
          taskData.template_text = processedTemplateText; // Store the processed text
          taskData.variables = newTask.templateVariables; // Keep original variables for reference
          taskData.scheduleDate = newTask.scheduleDate;
          taskData.scheduleTime = newTask.scheduleTime;
        }
      }

      // Save to Firestore first
      const newTaskData = await addTaskToUser(user.id, dateKey, taskData);

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

      // If SMS notification is enabled, open SMS confirmation dialog
      if (
        newTask.sendNotification === "yes" &&
        taskData.template_id &&
        user.phoneNumber
      ) {
        setTaskToSendSms(newTaskData);
        setSmsDialogOpen(true);
      } else {
        toast({
          title: "Success",
          description: "Task added successfully!",
          className: "bg-green-500 text-white border border-green-700",
        });
      }

      // Reset form and close dialog
      resetNewTaskForm();
      setAddTaskDialogOpen(false);
      setTaskDialogOpen(true); // Reopen the task list dialog to show the new task
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        className: "bg-red-500 text-white border border-red-700",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSmsConfirmation = async () => {
    if (!taskToSendSms) return;

    setSmsLoading(true);
    setSmsError(null);

    try {
      const smsData = {
        header: "ZIRAAT",
        template_id: taskToSendSms.template_id,
        numbers: user.phoneNumber,
        variables_values: taskToSendSms.variables || [],
      };

      // Add schedule_time if date is selected
      if (taskToSendSms.scheduleDate) {
        smsData.schedule_time = formatDateFns(
          taskToSendSms.scheduleDate,
          "dd-MM-yyyy-HH-mm"
        );
      }

      const response = await fetch("http://localhost:4000/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(smsData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "SMS sent successfully!",
          className: "bg-green-500 text-white border border-green-700",
        });
        setSmsDialogOpen(false);
        setTaskToSendSms(null);
      } else {
        setSmsError(result.error || "Failed to send SMS");
      }
    } catch (error) {
      setSmsError(error.message || "Failed to send SMS");
    } finally {
      setSmsLoading(false);
    }
  };

  const handleDeleteTaskClick = (task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    setLoading(true);
    try {
      const dateKey = formatDateKey(selectedDate);
      await deleteTaskFromUser(user.id, dateKey, taskToDelete.id);

      // Update local state
      const updatedTasks = { ...user.tasks };
      if (updatedTasks[dateKey]) {
        updatedTasks[dateKey] = updatedTasks[dateKey].filter(
          (task) => task.id !== taskToDelete.id
        );
        if (updatedTasks[dateKey].length === 0) {
          delete updatedTasks[dateKey];
        }
      }

      setUser({ ...user, tasks: updatedTasks });

      // Remove event from calendar
      setEvents(events.filter((event) => event.id !== taskToDelete.id));

      toast({
        title: "Success",
        description: "Task deleted successfully!",
        className: "bg-green-500 text-white border border-green-700",
      });

      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        className: "bg-red-500 text-white border border-red-700",
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

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setViewTaskDialogOpen(true);
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

  const downloadCSV = () => {
    if (!user || !user.tasks) {
      toast({
        title: "No Data",
        description: "No tasks available to download.",
        className: "bg-orange-500 text-white border border-orange-700",
      });
      return;
    }

    // Flatten all tasks and sort by date
    const allTasks = [];
    Object.keys(user.tasks).forEach((dateKey) => {
      user.tasks[dateKey].forEach((task) => {
        allTasks.push({
          ...task,
          date: dateKey,
        });
      });
    });

    // Sort by date (earliest to newest)
    allTasks.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (allTasks.length === 0) {
      toast({
        title: "No Data",
        description: "No tasks available to download.",
        className: "bg-orange-500 text-white border border-orange-700",
      });
      return;
    }

    // Define CSV headers
    const headers = [
      "Title",
      "Description",
      "Date",
      "Send Notification",
      "Template Title",
      "Template Text",
      "Template ID",
    ];

    // Convert tasks to CSV format
    const csvRows = [];
    csvRows.push(headers.join(","));

    allTasks.forEach((task) => {
      const row = [
        `"${(task.title || "").replace(/"/g, '""')}"`, // Escape quotes
        `"${(task.description || "").replace(/"/g, '""')}"`,
        task.date,
        task.sendNotification === "yes" ? "Yes" : "No",
        task.sendNotification === "yes"
          ? `"${(task.template_title || "").replace(/"/g, '""')}"`
          : "",
        task.sendNotification === "yes"
          ? `"${(task.template_text || "").replace(/"/g, '""')}"`
          : "",
        task.sendNotification === "yes" ? task.template_id || "" : "",
      ];
      csvRows.push(row.join(","));
    });

    // Create and download CSV file
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `tasks-${user.projectId}-${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "CSV file downloaded successfully!",
        className: "bg-green-500 text-white border border-green-700",
      });
    }
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

      {/* Download CSV Button and Back Button */}
      <div className="m-4 flex justify-between items-center">
        <Link href={`/admin/notifications/${user.projectId}`}>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </Link>

        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
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
                        {task.sendNotification === "yes" && (
                          <div className="mt-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              SMS Notification
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewTask(task)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTaskClick(task)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              Add Task for {format(selectedDate, "MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Task Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
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
            </div>

            {/* SMS Notification Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Send SMS Notification
                </label>
                <Select
                  value={newTask.sendNotification}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, sendNotification: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Template Selection */}
              {newTask.sendNotification === "yes" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMS Template
                    </label>
                    <Select
                      value={newTask.selectedTemplate}
                      onValueChange={handleTemplateChange}
                      disabled={templatesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem
                            key={template.template_id}
                            value={template.template_id}
                          >
                            {template.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Template Preview */}
                  {newTask.selectedTemplate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Template Preview
                      </label>
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                        {replaceTemplateVariables(
                          getSelectedTemplate()?.template || "",
                          newTask.templateVariables
                        )}
                      </div>
                    </div>
                  )}

                  {/* Variable Fields */}
                  {generateVariableFields().map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label} *
                      </label>
                      <Input
                        type="text"
                        value={field.value}
                        onChange={(e) =>
                          handleVariableChange(field.id, e.target.value)
                        }
                        placeholder={`Enter ${field.label}`}
                      />
                    </div>
                  ))}

                  {/* Schedule Section */}
                  <div className="space-y-4">
                    <div className="">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Schedule Date & Time (Optional)
                      </label>
                      <DatePicker
                        selected={newTask.scheduleDate}
                        onChange={(date) =>
                          setNewTask({ ...newTask, scheduleDate: date })
                        }
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="Pp"
                        placeholderText="Pick a date and time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        isClearable
                        popperClassName="z-50"
                        withPortal={false}
                        minDate={new Date()}
                        filterDate={(date) => date > new Date()}
                        wrapperClassName="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={resetNewTaskForm}>
                Reset
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddTaskDialogOpen(false);
                    resetNewTaskForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddTask}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? "Adding..." : "Add Task"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Task Dialog */}
      <Dialog open={viewTaskDialogOpen} onOpenChange={setViewTaskDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  {selectedTask.title}
                </div>
              </div>

              {selectedTask.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    {selectedTask.description}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMS Notification
                </label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  {selectedTask.sendNotification === "yes" ? "Yes" : "No"}
                </div>
              </div>

              {selectedTask.sendNotification === "yes" &&
                selectedTask.template_text && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Template ID
                      </label>
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                        {selectedTask.template_id}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Final SMS Text
                      </label>
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                        {replaceTemplateVariables(
                          selectedTask.template_text,
                          selectedTask.variables || []
                        )}
                      </div>
                    </div>

                    {selectedTask.variables &&
                      selectedTask.variables.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Variables
                          </label>
                          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                            {selectedTask.variables.map((variable, index) => (
                              <div key={index} className="mb-1">
                                <span className="font-medium">
                                  Variable {index + 1}:
                                </span>{" "}
                                {variable}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {(selectedTask.scheduleDate ||
                      selectedTask.scheduleTime) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Schedule
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                          {selectedTask.scheduleDate && (
                            <div>
                              Date:{" "}
                              {format(
                                new Date(selectedTask.scheduleDate),
                                "PPP"
                              )}
                            </div>
                          )}
                          {selectedTask.scheduleTime && (
                            <div>Time: {selectedTask.scheduleTime}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {taskToDelete?.title} task? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setTaskToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SMS Confirmation Dialog */}
      <Dialog open={smsDialogOpen} onOpenChange={setSmsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send SMS Confirmation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to send this SMS notification? This action
              cannot be undone.
            </p>
            {smsError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="text-red-500 text-sm">{smsError}</div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSmsDialogOpen(false);
                  setSmsError(null);
                  setTaskToSendSms(null);
                }}
                disabled={smsLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSmsConfirmation}
                disabled={smsLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {smsLoading ? "Sending..." : "Send SMS"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationCalendar;
