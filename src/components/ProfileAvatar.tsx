
import * as React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogOut, Settings, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { LoginDialog } from "@/components/auth/LoginDialog"
import { toast } from "sonner"

type ProfileAvatarProps = {
  nickname: string;
  characteristic: string;
  onProfileChange: (profile: { nickname: string; characteristic: string }) => void;
}

export function ProfileAvatar({ nickname, characteristic, onProfileChange }: ProfileAvatarProps) {
  const { user, signOut, updateProfile } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [currentNickname, setCurrentNickname] = React.useState(nickname)
  const [currentCharacteristic, setCurrentCharacteristic] = React.useState(characteristic)
  
  React.useEffect(() => {
    if (user) {
      setCurrentNickname(user.nickname);
      setCurrentCharacteristic(user.characteristic);
    } else {
      setCurrentNickname(nickname);
      setCurrentCharacteristic(characteristic);
    }
  }, [user, nickname, characteristic]);

  const handleSaveProfile = async () => {
    try {
      if (user) {
        await updateProfile({
          nickname: currentNickname,
          characteristic: currentCharacteristic
        });
        toast.success('프로필이 업데이트되었습니다.');
      } else {
        onProfileChange({
          nickname: currentNickname,
          characteristic: currentCharacteristic
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('프로필 업데이트에 실패했습니다.');
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('로그아웃되었습니다.');
    } catch (error) {
      toast.error('로그아웃에 실패했습니다.');
    }
  }

  const displayNickname = user ? user.nickname : nickname;
  const displayCharacteristic = user ? user.characteristic : characteristic;

  if (!user) {
    return (
      <LoginDialog
        trigger={
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${displayNickname}`} alt={displayNickname} />
              <AvatarFallback>{displayNickname.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${displayNickname}`} alt={displayNickname} />
              <AvatarFallback>{displayNickname.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-medium">{displayNickname}</p>
            <p className="text-xs text-muted-foreground">{displayCharacteristic}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            프로필 수정
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>프로필 수정</DialogTitle>
            <DialogDescription>
              닉네임과 칭호를 변경할 수 있습니다. 저장 버튼을 눌러주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nickname" className="text-right">
                닉네임
              </Label>
              <Input
                id="nickname"
                value={currentNickname}
                onChange={(e) => setCurrentNickname(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="characteristic" className="text-right">
                칭호
              </Label>
              <Input
                id="characteristic"
                value={currentCharacteristic}
                onChange={(e) => setCurrentCharacteristic(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveProfile}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
