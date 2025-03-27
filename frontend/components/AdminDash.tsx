"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, LogOut, Search, Shield, User, UserCheck, UserX, Users } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import router from "next/router"

export default function AdminDash() {
interface User {
    name: string;
    surname: string;
    intern_id: string;
    role: string;
    approval: string;
    }
    const [currentTime, setCurrentTime] = useState(new Date())
    const [searchQuery, setSearchQuery] = useState("")
    const [dtrStatus, setDtrStatus] = useState(null)
    const [error, setError] = useState<string | null>(null)
    const [internCnt, setInternCnt] = useState<{ role: string; surname: string; name: string; intern_id: string; approval: string; records: { clock_in: string; clock_out: string; status: string; }[]; }[] | null>(null)
    const [pendingCnt, setPendingCnt] = useState<{ role: string; surname: string; name: string; intern_id: string; approval: string; records: { clock_in: string; clock_out: string; status: string; }[]; }[] | null>(null)
    const [activeCnt, setActiveCnt] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
      const delay = 2000;
    
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
    
        const fetchRecord = fetch("/api/get_all", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error((await res.json()).message);
          return data;
        });
        const fetchActive = fetch("/api/get_active", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error((await res.json()).message);
            return data;
          });
    
        Promise.all([fetchUser, fetchRecord, fetchActive])
          .then(([userData, dtrInternRecord, dtrActiveIntern]) => {
            setUser(userData);
            setDtrStatus(dtrInternRecord);
            setActiveCnt(dtrActiveIntern)
            const initialInternRecord: { 
                role: string; 
                surname: string; 
                name: string; 
                intern_id: string;
                approval: string 
                records: { clock_in: string; clock_out: string; status: string; }[]; }[] = []
            dtrInternRecord.forEach((entry: { 
                role: string; 
                surname: string; 
                name: string; 
                intern_id: string; 
                approval: string;
                records: { clock_in: string; clock_out: string; status: string; }[]; }) => {
                initialInternRecord.push({
                    role: entry.role,
                    surname: entry.surname,
                    name: entry.name,
                    intern_id: entry.intern_id,
                    approval: entry.approval,
                    records: entry.records,
                });
            });

            const approvedInterns = initialInternRecord.filter(
                (intern) => intern.approval === "Approved"
              );
            setInternCnt(approvedInterns)

            const pendingInterns = initialInternRecord.filter(
                (intern) => intern.approval === "Pending"
              );
            setPendingCnt(pendingInterns)
            console.log(pendingInterns.length)
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

  const filteredInterns = internCnt?.filter(
    (intern) =>
      intern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intern.intern_id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleApprove = async (id: string, status: string) => {
    try {
        const response = await fetch("/api/update_approval", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intern_id: id, approval: status }),
        });
    
        if (!response.ok) {
          throw new Error((await response.json()).detail || "Failed to update approval");
        }
    
        return await response.json();
      } catch (error) {
        console.error("Error updating approval:", error);
        throw error;
      }
  }

  const handleReject = async (id: string, status: string) => {
    try {
        const response = await fetch("/api/update_approval", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intern_id: id, approval: status }),
        });
    
        if (!response.ok) {
          throw new Error((await response.json()).detail || "Failed to update approval");
        }
    
        return await response.json();
      } catch (error) {
        console.error("Error updating approval:", error);
        throw error;
      }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6" />
          <span className="text-lg font-bold">TimeTrack</span>
          <Badge variant="outline" className="ml-2 bg-primary/10">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/settings">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="icon" onClick={() => {
              localStorage.removeItem("access_token")
              localStorage.removeItem("role")
              router.push("/")
          }}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </Link>
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
            <AvatarFallback>{user?.name[0]}{user?.surname[0]}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage interns and track their time records</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Interns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{internCnt ? internCnt.length : 0}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <UserCheck className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{pendingCnt ? pendingCnt.length : 0}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{activeCnt ? activeCnt.length : 0}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="interns" className="space-y-4">
          <TabsList>
            <TabsTrigger value="interns">Interns</TabsTrigger>
            <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          </TabsList>

          <TabsContent value="interns">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Manage Interns</CardTitle>
                    <CardDescription>View and manage intern time records</CardDescription>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search interns..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Name</th>
                        <th className="text-left p-4 font-medium">Time In</th>
                        <th className="text-left p-4 font-medium">Time Out</th>
                        <th className="text-left p-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInterns?.map((intern) => (
                        <tr key={intern.intern_id} className="border-b">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{intern.name.charAt(0)}{intern.surname.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{intern.name} {intern.surname}</div>
                                <div className="text-sm text-muted-foreground">{intern.intern_id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            {intern.records.length > 0 
                                ? new Date(new Date(intern.records[intern.records.length - 1].clock_in).getTime() + 8 * 60 * 60 * 1000)
                                    .toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                                : "N/A"}
                            </td>
                            <td className="p-4">
                            {intern.records.length > 0 
                                ? new Date(new Date(intern.records[intern.records.length - 1].clock_out).getTime() + 8 * 60 * 60 * 1000)
                                    .toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                                : "N/A"}
                          </td>
                          <td className="p-4">
                            <Badge 
                            variant="outline" 
                                className={`
                                    ${intern.records.length === 0 
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : intern.records[intern.records.length - 1].status === "Completed" 
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : "bg-green-50 text-green-700 border-green-200"
                                    }
                                `}
                                >
                                {intern.records.length > 0 
                                    ? intern.records[intern.records.length - 1].status  
                                    : "No Record"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Approve or reject intern applications</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Name</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingCnt?.map((intern) => (
                        <tr key={intern.intern_id} className="border-b">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{intern.name.charAt(0)}{intern.surname.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{intern.name} {intern.surname}</div>
                                <div className="text-sm text-muted-foreground">{intern.intern_id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                                onClick={() => handleApprove(intern.intern_id, "Approved")}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                                onClick={() => handleReject(intern.intern_id, "Rejected")}
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

