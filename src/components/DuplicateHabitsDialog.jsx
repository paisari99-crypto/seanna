import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DuplicateHabitsDialog({ open, onOpenChange, duplicates }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        style={{ 
          backgroundColor: '#1A1D24', 
          borderColor: '#1A1D24',
          maxWidth: '400px'
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: '#E8EAF0' }}>
            Similar habits found
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          <p className="text-sm" style={{ color: '#9AA3B2' }}>
            These habits have similar names. Consider merging or renaming them for clarity.
          </p>
          {duplicates.map((group, idx) => (
            <div 
              key={idx}
              className="p-3"
              style={{
                backgroundColor: '#0F1115',
                borderRadius: '12px'
              }}
            >
              {group.map((habit, i) => (
                <p 
                  key={habit.id} 
                  className="text-sm"
                  style={{ 
                    color: '#E8EAF0',
                    marginBottom: i < group.length - 1 ? '4px' : '0'
                  }}
                >
                  • {habit.name}
                </p>
              ))}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}