#!/bin/sh

#  set.env.sh
#
#
#  Created by Flowers, Jay on 11/8/12.
#

echo -n -e "\033]0;Vistacore-adk\007"

export TEMP=/tmp
export GRADLE_HOME=/usr/local/gradle/gradle-2.4
export M2_HOME=/usr/local/maven/apache-maven-3.0.4
export GROOVY_HOME=/usr/local/groovy/groovy-2.0.6
export MAVEN_OPTS="-Xmx1G -Xms256m -Djava.awt.headless=true"
export GRADLE_OPTS="-Xmx1G -Xms256m -XX:MaxPermSize=512m -XX:PermSize=256m -Dorg.gradle.daemon=true -Dorg.gradle.parallel=true -Dorg.gradle.workers.max=4"

export CONFIGURE_ARGS="--with-ldflags='-Wno-error=unused-command-line-argument-hard-error-in-future'"

INSTALL_FOR_USER=$USER
if [ ! -z "$SUDO_USER" ]; then
  INSTALL_FOR_USER=$SUDO_USER
fi

INSTALL_IN_HOME="/Users/$INSTALL_FOR_USER"
if [ ! -d $INSTALL_IN_HOME ]; then
  INSTALL_IN_HOME="/home/$INSTALL_FOR_USER"
fi

if [ ! -d $INSTALL_IN_HOME ]; then
  "failure: unable to find home directory for user $INSTALL_FOR_USER"
  exit 1
fi

export WORKSPACE=$INSTALL_IN_HOME/Projects/vistacore
export BERKSHELF_PATH=$WORKSPACE/.berkshelf
export VAGRANT_HOME=$WORKSPACE/.vagrant.d
export GEM_HOME=$WORKSPACE/.gems

if [ -f $WORKSPACE/common_set_env.sh ]; then 
  source $WORKSPACE/common_set_env.sh
else
  printf "\n"
  echo "ERROR: Cannot locate file: $WORKSPACE/common_set_env.sh. Please run configure_workspace.sh to continue."
  printf "\n"
  return
fi

if uname -a | grep -q "Darwin"; then
  export PATH=/usr/local/git/bin:$PATH
fi

export PATH=$GEM_HOME/bin:$JAVA_HOME/bin:$M2_HOME/bin:$GROOVY_HOME/bin:$GRADLE_HOME/bin:/opt/chefdk/bin:/opt/chefdk/embedded/bin:$PATH
export GEM_PATH=$GEM_HOME:/opt/chefdk/embedded/lib/ruby/gems/2.3.0
export BUNDLE_PATH=$GEM_HOME

function vagrant(){
  (
    /usr/bin/vagrant $@
    echo -n -e "\033]0;Vistacore-adk\007"
  )
}
