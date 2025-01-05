import { Menu } from "lucide-react";
import { NavLink } from "react-router";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

const ghostButtonStyling: string =
  "hover:bg-accent hover:text-accent-foreground";

const MobileNavigation = () => {
  return (
    <div className="flex md:hidden justify-center items-center px-4">
      <Sheet>
        <SheetTrigger asChild>
          <Menu className={`${ghostButtonStyling} md:hidden`} size={30} />
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col space-y-4 mt-8">
            <NavLink to="/" className="flex items-center space-x-2 mb-8">
              <span className="font-bold text-xl">Practice Chess</span>
            </NavLink>
            <Accordion type="single" collapsible>
              <AccordionItem value="practice">
                <AccordionTrigger>Study</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col space-y-2">
                    <NavLink to="/" className="p-2 hover:bg-muted rounded-md">
                      Learn Chess Rules
                    </NavLink>
                    {practiceNavComponent.map((item) => (
                      <NavLink
                        key={item.title}
                        to={item.href}
                        className="p-2 hover:bg-muted rounded-md"
                      >
                        {item.title}
                      </NavLink>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="games">
                <AccordionTrigger>Play Games</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col space-y-2">
                    {gameNavComponent.map((item) => (
                      <NavLink
                        key={item.title}
                        to={item.href}
                        className="p-2 hover:bg-muted rounded-md"
                      >
                        {item.title}
                      </NavLink>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="coordinates">
                <AccordionTrigger>Coordinates</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col space-y-2">
                    {coordinatesNavComponent.map((item) => (
                      <NavLink
                        key={item.title}
                        to={item.href}
                        className="p-2 hover:bg-muted rounded-md"
                      >
                        {item.title}
                      </NavLink>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <NavLink to="/docs" className="p-2 hover:bg-muted rounded-md">
              View Analytics
            </NavLink>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavigation;
