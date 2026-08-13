# NutriFit Coach

Build a polished V1.0 mobile-first fitness and nutrition app called:



NUTRIFIT

Train. Eat. Improve.



Use the uploaded NutriFit logo as the official brand logo. Do not redesign or replace it.



CORE IDEA:

NutriFit is a personal fitness coach that combines nutrition tracking, workout tracking and progress tracking. It should feel like having a personal trainer inside the phone.



1. ACCOUNT & RECOVERY

Do NOT create login, signup, email/password or social login.



When a user creates their profile, generate a unique 11-character Keypass containing both letters and numbers, for example: A7K4M92P1XZ.



Show the Keypass clearly after setup with:

- Copy button

- Save/reminder message

- Restore Data option



Users can enter their Keypass later to restore their saved NutriFit data. Keep each user's data isolated and secure.



2. ONBOARDING

Create a short, clean onboarding flow asking for:

- Name

- Age

- Gender

- Height

- Weight

- Activity level

- Fitness goal

- Workout experience

- Preferred workout days



Use this information to create estimated calorie and nutrition targets.



3. AI TRAINER

Make the trainer a major part of the app.



Let users choose from 5 different trainer faces/body styles. Each trainer should have a distinct appearance and personality.



The trainer should appear throughout the app and give short, simple messages based on the user's actual data.



Examples:

"Ready for today's workout?"

"Good set."

"You're on track with protein."

"New personal best!"

"Rest day. Recover well."



The trainer should never diagnose medical conditions or encourage unsafe training.



4. NUTRITION

The user ONLY types what they ate. Do not add food-photo recognition or barcode scanning in V1.0.



Example:

"2 eggs, 2 rotis and 1 banana"



Analyze the text and show ESTIMATED:

- Calories

- Protein

- Carbohydrates

- Fat

- Fiber

- Sugar

- Saturated fat

- Sodium

- Available useful micronutrients



Allow the user to:

- Choose meal type: Breakfast, Lunch, Snack, Dinner

- Edit nutrition values

- Delete meals

- Save meals

- Reuse recent meals



Show daily targets versus actual intake with clean progress visuals.



Clearly label nutrition values as estimates because portions, brands and recipes can vary.



5. WORKOUT SYSTEM

Allow users to create and edit their own weekly workout plan.



They can:

- Choose workout days

- Add exercises

- Set sets

- Set reps

- Record weight

- Set rest time

- Reorder exercises

- Remove exercises



Include a useful exercise library covering chest, back, legs, shoulders, arms and core.



During an active workout:

- Show current exercise

- Show sets/reps/weight

- Let users complete each set

- Include a smooth rest timer

- Show previous performance

- Save the completed workout



Example:

Previous: 20 kg × 10

Trainer: "Try to match or beat your last workout."



Automatically detect personal bests and celebrate them with a subtle premium animation.



6. PROGRESS

Create a clean Progress section showing:

- Weight progress

- Body measurements

- Strength progress

- Personal records

- Workout consistency

- Nutrition consistency

- Optional progress photos

- Weekly summary



Include simple graphs for useful trends without making the screen complicated.



Generate a short weekly trainer summary such as:

"You trained 4 times this week and improved your strength. Keep your protein consistent."



7. ACHIEVEMENTS & STREAKS

Add achievements such as:

- First Workout

- 10 Workouts

- New Personal Best

- 7 Day Streak

- 30 Day Streak

- Nutrition Goal



Track food and workout consistency.



Scheduled rest days must NOT break a workout streak.



8. MAIN NAVIGATION

Use a simple 5-section mobile navigation:

Home

Nutrition

Workout

Progress

Trainer



Home should show the most important information for today:

- Trainer message

- Calories

- Protein

- Today's workout

- Progress summary

- Quick actions



9. PREMIUM UI/UX

The app must look premium, aesthetic and modern—not like a generic template.



Design direction:

- Dark-first interface

- Deep near-black backgrounds

- Elegant dark cards

- Clean white/off-white typography

- Use the NutriFit logo's green/yellow/orange energy as inspiration for accents

- Subtle gradients

- Premium rounded cards

- Strong typography

- Excellent spacing

- Minimal and clean icons

- High-quality trainer visuals



Use smooth, purposeful animations:

- Smooth page transitions

- Subtle card entrance animations

- Animated progress rings

- Smooth number updates

- Smooth workout/rest transitions

- Subtle button press feedback

- Premium workout-complete animation



Avoid excessive bouncing, flashing, unnecessary gradients or distracting animations.



The app must feel fast and responsive.



10. DATA & LOGIC

Keep the data structure organized around:

User Profile

Keypass

Trainer

Goals

Meals/Foods

Nutrition Targets

Workout Plans

Exercises

Workout Sessions

Sets

Progress Measurements

Personal Records

Achievements



Normal calculations such as nutrition totals, streaks, workout history and personal records should be handled by application logic/database, not invented by AI.



AI should mainly handle natural-language food interpretation, trainer conversation and personalized insights.



11. V1.0 LIMITS

Do NOT add:

- Food image recognition

- Barcode scanning

- Wearable integration

- Smartwatch features

- Social feed

- Followers/friends

- Live video trainer

- AI body analysis

- Camera exercise-form detection

- Sleep tracking

- Heart-rate tracking

- Advanced recovery metrics



FOCUS ON MAKING THE CORE EXPERIENCE COMPLETE, STABLE AND BEAUTIFUL.



Before finishing, make sure all navigation, buttons, forms, database actions, workout logging, nutrition logging, Keypass recovery, progress calculations and trainer interactions actually work—not just visually.



Build it as a cohesive premium product, not as separate demo screens.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f9a6cab6-f977-4b67-b0cf-79b47cd07afb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
