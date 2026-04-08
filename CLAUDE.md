## Purpose:
Browser based tool for simulating, analyzing, and synthesizing 4 bar linkage mechanisms

## Task Planning
Claude should plan and break up tasks to avoid hitting usage limits mid-task.
Aim for logical milestones for completing tasks so that progress can be commited before limits are reached.
Let me know any time a task is likely to be interrupted by usage limits.

## Coding:
Written using html & javascript, with D3 to facilitate interactive svg content

## UI:
SVG representation of the 4 bar linkage is interactive, such that user can drag link nodes to adjust the linage geometry.
Actuated motion of the current geometry linkage can be performed by dragging a slider who's limits reflect the motion limits of the linkage itself (based on limits of input and output links).
All buttons and user inputs/interactions should be contained within the SVG window.
This should be setup to look and function properly on eiher desktop or mobile browsers.

## Current State & Progress:
Some boiler plate files are included in the repo to get things started and indicate the overall file structure

## Next Tasks
As a minimum initial task, would like at least a visual representation of an initial/default 4 bar linkgage.
As usage limits allow, add:
  * Ability to change linkage geometry by dragging nodes
  * Ability to actuate linkage in its current configuration
