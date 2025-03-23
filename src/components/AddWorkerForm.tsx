import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAppContext } from "../context/AppContext";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define the form schema with zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  joiningDate: z.date({
    required_error: "Please select a joining date",
  }),
  dailyWage: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, { message: "Daily wage must be at least 1" })
  ),
});

type FormValues = z.infer<typeof formSchema>;

const AddWorkerForm: React.FC = () => {
  const { addWorker, workers } = useAppContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      joiningDate: new Date(),
      dailyWage: undefined,
    },
  });

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setImageError("Please upload an image file");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be less than 5MB");
      return;
    }
    
    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setProfilePicture(objectUrl);
  };

  // Clear selected image
  const clearImage = () => {
    setProfilePicture(null);
    setImageError(null);
  };

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    // Check if worker with same name already exists
    const existingWorker = workers.find(worker => 
      worker.name.toLowerCase() === data.name.toLowerCase()
    );
    
    if (existingWorker) {
      toast({
        variant: "destructive",
        title: "Worker already exists",
        description: "A worker with this name already exists.",
      });
      return;
    }
    
    // Add the new worker
    const newWorker = {
      name: data.name,
      joiningDate: data.joiningDate.toISOString().split('T')[0],
      dailyWage: data.dailyWage,
      profilePicture: profilePicture || undefined,
    };
    
    const newWorkerId = addWorker(newWorker);
    
    toast({
      title: "Worker added successfully",
      description: `${data.name} has been added to the workers list.`,
    });
    
    // Navigate to the worker's detail page using the returned ID
    navigate(`/workers/${newWorkerId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="space-y-2">
            <FormLabel>Profile Picture</FormLabel>
            <div className="flex flex-col items-center">
              {profilePicture ? (
                <div className="relative">
                  <img 
                    src={profilePicture} 
                    alt="Profile preview" 
                    className="h-32 w-32 rounded-full object-cover border-2 border-primary"
                  />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon"
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                    onClick={clearImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-32 w-32 rounded-full bg-secondary flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted-foreground">
                    <Upload className="h-10 w-10" />
                  </div>
                  <Input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="max-w-xs"
                  />
                </div>
              )}
              {imageError && (
                <Alert variant="destructive" className="mt-2 max-w-xs">
                  <AlertDescription>{imageError}</AlertDescription>
                </Alert>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Optional: Upload a profile picture
              </p>
            </div>
          </div>

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter worker name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Joining Date */}
          <FormField
            control={form.control}
            name="joiningDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Joining</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Daily Wage */}
          <FormField
            control={form.control}
            name="dailyWage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daily Wage (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter daily wage amount" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            Add Worker
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddWorkerForm;
