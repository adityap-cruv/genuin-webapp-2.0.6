import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu'
import { GenuinLogo } from '@components/ui/genuin-logo'
import { BurgerMenuIcon } from '@components/ui/ham-burger'
import Link from 'next/link'

export function NavBar() {
  return (
    <nav className="fixed top-0 z-50 m-auto flex h-navbar w-full bg-monochrome-white">
      <div className="container flex h-full items-center justify-between py-1">
        <GenuinLogo.desktop variant="dark" />
        <div className="flex items-center">
          <Dialog modal={false}>
            <DialogTrigger>
              <Button variant="default" size="sm">
                <p className="text-title-sm text-primary-foreground">Get App</p>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <p>Hello world..</p>
            </DialogContent>
          </Dialog>
          <BurgerMenu />
        </div>
      </div>
    </nav>
  )
}

// todo configure paths.
function BurgerMenu() {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <BurgerMenuIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-monochrome-black/90 px-3">
        <DropdownMenuItem>
          <Link href="https://careers.begenuin.com" className="w-full">
            <p className="text-right text-title-xl text-monochrome-white">Join Our Team</p>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <p className="w-full text-right text-title-xl text-monochrome-white">Life at Genuin</p>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <p className="w-full text-right text-title-xl text-monochrome-white">Terms of Service</p>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <p className="w-full text-right text-title-xl text-monochrome-white">Privacy Policy</p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
