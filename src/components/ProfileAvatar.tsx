
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


type ProfileAvatarProps = {
  nickname: string;
  characteristic: string;
  onProfileChange: (profile: { nickname: string; characteristic: string }) => void;
}

export function ProfileAvatar({ nickname, characteristic, onProfileChange }: ProfileAvatarProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [currentNickname, setCurrentNickname] = React.useState(nickname)
  const [currentCharacteristic, setCurrentCharacteristic] = React.useState(characteristic)
  
  React.useEffect(() => {
    setCurrentNickname(nickname);
    setCurrentCharacteristic(characteristic);
  }, [nickname, characteristic]);

  const handleSaveProfile = () => {
    onProfileChange({
      nickname: currentNickname,
      characteristic: currentCharacteristic
    });
    setIsDialogOpen(false);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${nickname}`} alt={nickname} />
            <AvatarFallback>{nickname.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
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
  )
}
