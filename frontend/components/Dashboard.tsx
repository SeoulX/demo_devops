"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, LogOut, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  interface User {
    name: string;
    surname: string;
    intern_id: string;
    role: string;
    approval: string;
  }

  const [timeEntries, setTimeEntries] = useState<{ date: string; clock_in: string; clock_out: string; total_work_hours: string }[]>([]);
  const [weeklySum, setWeeklySum] = useState<{ day: string; hours: string }[]>([]);
  const [clockedIn, setClockedIn] = useState(false)
  const [statusActivity, setStatusActivity] = useState<string | null>(null)
  const [currentDate] = useState(new Date())
  const [clockInTime, setClockInTime] = useState<string | null>(null)
  const [clockOutTime, setClockOutTime] = useState<string | null>(null)
  const [totalClockTime, setTotalClockTime] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())


  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dtrStatus, setDtrStatus] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const delay = 5000;
  
    const timer = setTimeout(() => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("No token found. Please log in.");
        router.push("/");
        return;
      }
  
      const fetchUser = fetch("/api/user", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }).then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("access_token");
            router.push("/");
          }
          throw new Error((await res.json()).message);
        }
        return res.json();
      });
  
      const fetchDtrStatus = fetch("/api/check_clock_in&out", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error((await res.json()).message);
        return data;
      });
      const fetchRecord = fetch(`/api/get_record`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error((await res.json()).message);
        return data;
      });
  
      Promise.all([fetchUser, fetchDtrStatus, fetchRecord])
        .then(([userData, dtrData, dtrRecord]) => {
          setUser(userData);
          setDtrStatus(dtrData);

          if (dtrRecord.length === 0) {
            console.log("No records found. Allowing user to proceed.");
            setTimeEntries([]);
            setWeeklySum([]);
            return;
          }
          const initialDTRRecord: { date: any; clock_in: string; clock_out: string; total_work_hours: string }[] = []
          dtrRecord.forEach((entry: { date: any; clock_in: string | number | Date; clock_out: string | number | Date; total_work_hours: string }) => {
            const clock_in_utcDate = new Date(entry.clock_in);
            const clock_in_phTime = new Date(clock_in_utcDate.getTime() + 8 * 60 * 60 * 1000);
            const clock_out_utcDate = new Date(entry.clock_out);
            const clock_out_phTime = new Date(clock_out_utcDate.getTime() + 8 * 60 * 60 * 1000);
            initialDTRRecord.push({
              date: entry.date,
              clock_in: new Date(clock_in_phTime).toLocaleTimeString("en-PH", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Manila"
              }),
              clock_out: new Date(clock_out_phTime).toLocaleTimeString("en-PH", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Manila"
              }),
              total_work_hours: entry.total_work_hours + "h"
            });
          });
          const initialWeekly: { day: string; hours: string }[] = []
          dtrRecord.forEach((entry: { date: any; clock_in: string | number | Date; clock_out: string | number | Date; total_work_hours: string }) => {
            initialWeekly.push({
              day: new Date(entry.date).toLocaleDateString("en-PH", { weekday: "long", timeZone: "Asia/Manila" }),
              hours: entry.total_work_hours
            });
          });
          console.log(initialDTRRecord)
          console.log(initialWeekly)
          setTimeEntries(initialDTRRecord)
          setWeeklySum(initialWeekly)

          const status = dtrData.detail["status"]
  
          if (dtrData.status_code === 400) {
            if (dtrData.detail["status"] === "Completed") {
              setClockedIn(false);
              const clock_in_utcDate = new Date(dtrData.detail["clock_in"]);
              const clock_in_phTime = new Date(clock_in_utcDate.getTime() + 8 * 60 * 60 * 1000);
              const in_formattedTime = clock_in_phTime.toLocaleTimeString("en-PH", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Manila",
              });
              setClockInTime(in_formattedTime);
  
              const clock_out_utcDate = new Date(dtrData.detail["clock_out"]);
              const clock_out_phTime = new Date(clock_out_utcDate.getTime() + 8 * 60 * 60 * 1000);
              const out_formattedTime = clock_out_phTime.toLocaleTimeString("en-PH", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Manila",
              });
              setClockOutTime(out_formattedTime);
              const totalTime = dtrData.detail["total_work_hours"].toString();
              setTotalClockTime(totalTime);
              setStatusActivity(status)
            } else {
              setClockedIn(true);
              const clock_in_utcDate = new Date(dtrData.detail["clock_in"]);
              const clock_in_phTime = new Date(clock_in_utcDate.getTime() + 8 * 60 * 60 * 1000);
              const in_formattedTime = clock_in_phTime.toLocaleTimeString("en-PH", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Manila",
              });
              setClockInTime(in_formattedTime);
              setStatusActivity(status)
            }
          }
        })
        .catch((err) => setError(err.message));
  
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
  
      return () => {
        clearInterval(interval);
      };
    }, delay);
  
    return () => clearTimeout(timer);
  }, [dtrStatus]);
  
  const formatTimeForDisplay = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleClockIn = async () => {
    const now = new Date();
    const formattedTime = formatTimeForDisplay(now);
    const token = localStorage.getItem("access_token");
    try {
        const response = await fetch("api/clock_in", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log(data)
        if (!response.ok) {
            if (response.status === 400 && data.detail === "You have already clocked in today.") {
                alert("Already clocked in. Button will be disabled.");
                setClockedIn(true); 
            } else {
                alert(data.message)
            }
        } else {
            console.log("Clocked in successfully:", data);
            setClockedIn(true);
            setClockInTime(formattedTime);
            setClockOutTime(null);
        }

    } catch (error) {
            console.error("Clock-in error:", error);
    }
  };


  const handleClockOut = async () => {
    const now = new Date()
    const formattedTime = formatTimeForDisplay(now)
    const token = localStorage.getItem("access_token")
    try{
        const response = await fetch("api/clock_out", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (!response.ok) {
            if (response.status === 400 && data.detail === "You have already clocked out today.") {
                console.warn("Already clocked out. Button will be disabled.");
                setClockedIn(true); 
            } else {
                throw new Error(data.detail || "Clock-out failed");
            }
        } else {
            console.log("Clocked out successfully:", data);
            setClockedIn(false)
            setClockOutTime(formattedTime)
        }

    }catch (error) {
        console.error("Clock-in error:", error);
    }
  }

  if (error) return <p className="text-red-500">{error}</p>
  if (!user) return <p>Loading...</p>

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 flex h-14 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6" />
          <span className="text-lg font-bold">TimeTrack</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/profile">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => {
              localStorage.removeItem("access_token")
              localStorage.removeItem("role")
              router.push("/")
          }}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback>{user.name[0]}{user.surname[0]}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 space-y-6">
        <div className="text-2xl font-bold">Welcome, {user.name} {user.surname}</div>
        <p className="text-muted-foreground">Email: {user.intern_id} | Role: {user.role}</p>

        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle>Daily Time Record</CardTitle>
            <CardDescription>Track your working hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold tabular-nums">{formatTimeForDisplay(currentTime)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {statusActivity || "Not Clocked In"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className="h-16 text-lg"
                  onClick={handleClockIn}
                  disabled={clockedIn}
                  variant={clockedIn ? "outline" : "default"}
                >
                  Clock In
                </Button>
                <Button
                  size="lg"
                  className="h-16 text-lg"
                  onClick={handleClockOut}
                  disabled={!clockedIn}
                  variant={!clockedIn ? "outline" : "default"}
                >
                  Clock Out
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">Clock In</div>
                  <div className="font-medium">{clockInTime || "--:--"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Clock Out</div>
                  <div className="font-medium">{clockOutTime || "--:--"}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-muted-foreground">Total Hours</div>
                  <div className="font-medium">{totalClockTime || "0h" || "--:--"}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="time-entries" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="time-entries">Time Entries</TabsTrigger>
            <TabsTrigger value="weekly-summary">Weekly Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="time-entries">
            <Card>
              <CardHeader>
                <CardTitle>Recent Time Entries</CardTitle>
                <CardDescription>Your attendance records</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-left p-4 font-medium">Clock In</th>
                        <th className="text-left p-4 font-medium">Clock Out</th>
                        <th className="text-left p-4 font-medium">Total Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                        {timeEntries.map((entry) => (
                            <tr key={entry.date} className="border-b">
                            <td className="p-4">{entry.date}</td>
                            <td className="p-4">{entry.clock_in}</td>
                            <td className="p-4">{entry.clock_out}</td>
                            <td className="p-4">{entry.total_work_hours}</td>
                            </tr>
                        ))}
                        </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly-summary">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Summary</CardTitle>
                <CardDescription>Your working hours for the current week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Daily Breakdown</h3>
                    <div className="space-y-4">
                      {weeklySum.map((day) => (
                        <div key={day.day} className="flex items-center">
                          <div className="w-24 text-sm font-medium">{day.day}</div>
                          <div className="flex-1">
                            <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${(parseFloat(day.hours) / 8) * 100}%` }}></div>
                            </div>
                          </div>
                          <div className="w-16 text-right text-sm font-medium">{day.hours}h</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
