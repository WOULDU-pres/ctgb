
import { useState } from "react";
import { Moon, Settings, Sun, Sliders, Palette } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SettingsPanel from "@/components/settings/SettingsPanel";

export function SettingsToggle() {
  const { setTheme } = useTheme();
  const [showPersonalizationSettings, setShowPersonalizationSettings] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setShowPersonalizationSettings(true)}>
            <Sliders className="mr-2 h-4 w-4" />
            개인화 설정
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <Sun className="mr-2 h-4 w-4" />
            라이트 테마
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon className="mr-2 h-4 w-4" />
            다크 테마
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showPersonalizationSettings} onOpenChange={setShowPersonalizationSettings}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              개인화 설정
            </DialogTitle>
          </DialogHeader>
          <SettingsPanel onClose={() => setShowPersonalizationSettings(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
