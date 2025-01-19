import { Menu } from "lucide-react";
import { NavLink } from "react-router";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  practiceNavComponent,
  gameNavComponent,
  coordinatesNavComponent,
} from "@/lib/navigation-components";
import { useState } from "react";

const ghostButtonStyling: string =
  "hover:bg-accent hover:text-accent-foreground";

const MobileNavigation = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex md:hidden justify-center items-center px-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Menu className={`${ghostButtonStyling} md:hidden`} size={30} />
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col space-y-4 mt-8">
            <SheetClose asChild>
              <NavLink to="/" className="flex items-center space-x-2 mb-8">
                <SheetTitle>
                  <span className="font-bold text-xl">Practice Chess</span>
                </SheetTitle>
                <SheetDescription className="hidden">
                  Main Navigation
                </SheetDescription>
              </NavLink>
            </SheetClose>
            <Accordion type="single" collapsible>
              <AccordionItem value="practice">
                <AccordionTrigger>Study</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col space-y-2">
                    <SheetClose asChild>
                      <NavLink to="/" className="p-2 hover:bg-muted rounded-md">
                        Learn Chess Rules
                      </NavLink>
                    </SheetClose>
                    {practiceNavComponent.map((item) => (
                      <SheetClose asChild key={item.title}>
                        <NavLink
                          to={item.href}
                          className="p-2 hover:bg-muted rounded-md"
                        >
                          {item.title}
                        </NavLink>
                      </SheetClose>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="games">
                <AccordionTrigger>Play Games</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col space-y-2">
                    {gameNavComponent.map((item) => (
                      <SheetClose asChild key={item.title}>
                        <NavLink
                          to={item.href}
                          className="p-2 hover:bg-muted rounded-md"
                        >
                          {item.title}
                        </NavLink>
                      </SheetClose>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="coordinates">
                <AccordionTrigger>Coordinates</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col space-y-2">
                    {coordinatesNavComponent.map((item) => (
                      <SheetClose asChild key={item.title}>
                        <NavLink
                          to={item.href}
                          className="p-2 hover:bg-muted rounded-md"
                        >
                          {item.title}
                        </NavLink>
                      </SheetClose>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <SheetClose asChild>
              <NavLink to="/docs" className="p-2 hover:bg-muted rounded-md">
                View Analytics
              </NavLink>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavigation;
