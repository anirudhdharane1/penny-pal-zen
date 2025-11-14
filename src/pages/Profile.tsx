import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { getToken } from "@/lib/api";
import { User, Mail, Briefcase, Camera } from "lucide-react";

const API_USER = "http://localhost:5000/api/users/me";
const API_UPDATE = "http://localhost:5000/api/users/update";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch(API_USER, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setUser(data);
      setFormData(data);
    } catch {
      toast.error("Error fetching profile data");
    }
  }

  async function handleSave() {
    try {
      const res = await fetch(API_UPDATE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      });
      const updatedUser = await res.json();
      setUser(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    }
  }

  // Get initials from name for avatar
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  if (!user)
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center text-white py-20">
          <div className="animate-pulse">Loading...</div>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="p-8 text-white">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#9b5cff] to-[#e65cff] bg-clip-text text-transparent mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-400">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <Card className="bg-[#141418]/60 border border-white/10 p-6 md:p-8 rounded-2xl shadow-[0_0_40px_rgba(155,92,255,0.15)]">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#9b5cff] to-[#e65cff] flex items-center justify-center text-4xl font-bold shadow-[0_0_30px_rgba(155,92,255,0.4)]">
                {getInitials(formData.name)}
              </div>
              <button
                className="absolute bottom-0 right-0 w-10 h-10 bg-[#1a1a20] border border-white/20 rounded-full flex items-center justify-center hover:bg-[#252528] transition-colors group-hover:scale-110 transform duration-200"
                onClick={() => toast.info("Profile picture upload coming soon!")}
              >
                <Camera className="w-5 h-5 text-[#9b5cff]" />
              </button>
            </div>
            <h2 className="mt-4 text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4 text-[#9b5cff]" />
                Full Name
              </label>
              <Input
                type="text"
                disabled={!isEditing}
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[#1a1a20] border border-white/10 text-white focus:border-[#9b5cff] focus:ring-1 focus:ring-[#9b5cff] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4 text-[#9b5cff]" />
                Email Address
              </label>
              <Input
                type="email"
                disabled
                value={formData.email || ""}
                className="bg-[#1a1a20] border border-white/10 text-white opacity-60 cursor-not-allowed"
                placeholder="your.email@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Occupation */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Briefcase className="w-4 h-4 text-[#9b5cff]" />
                Occupation
              </label>
              <Input
                type="text"
                disabled={!isEditing}
                value={formData.occupation || ""}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="bg-[#1a1a20] border border-white/10 text-white focus:border-[#9b5cff] focus:ring-1 focus:ring-[#9b5cff] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="e.g., Software Engineer, Student, etc."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/10">
            {isEditing ? (
              <>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(user);
                  }}
                  className="bg-[#1a1a20] text-white border border-white/10 hover:bg-[#252528] transition-all"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-[#9b5cff] to-[#e65cff] text-white hover:shadow-[0_0_20px_rgba(155,92,255,0.4)] transition-all"
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-[#9b5cff] to-[#e65cff] text-white hover:shadow-[0_0_20px_rgba(155,92,255,0.4)] transition-all"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
